var koSharepoint = (function (_, $, ko) {
	'use strict';

	var koSharepoint = {
		settings: {
			layoutsUrl: '/_layouts/15/',
			VERSION: '1.0.0.0'
		},
		fields: {}
	};

	function getFieldModelInstance(fieldInternalName) {
		var propName = _.camelCase(fieldInternalName);

		var viewModel = koSharepoint.fields[propName];
		if (!viewModel) {
			throw new Error('Cannot find model instance for field' + fieldInternalName);
		}
		return viewModel;
	}

	function setFieldModelInstance(fieldInternalName, model) {
		var propName = _.camelCase(fieldInternalName);
		koSharepoint.fields[propName] = model;
	}

	function KoErrorsFieldValidator(fieldInternalName) {
		var validator = this;

		validator.Validate = function (value) {
			var viewModel = getFieldModelInstance(fieldInternalName);
			var isError = false;
			var errorMessage = 'This field has some errors';
			if (typeof viewModel.hasErrors === 'function') {
				var errors = viewModel.hasErrors();
				if (errors && typeof errors === 'string') {
					isError = true;
					errorMessage = errors;
				} else {
					isError = !!errors;
				}
			}
			return new SPClientForms.ClientValidation.ValidationResult(isError, errorMessage);
		};
	}

	function KoRequiredFieldValidator(fieldInternalName) {
		var validator = this;

		validator.Validate = function (value) {
			var viewModel = getFieldModelInstance(fieldInternalName);
			var isError = false;
			var errorMessage = 'This field has some errors';
			if (_.isEmpty(viewModel.getData())) {
				isError = true;
				errorMessage = 'This field can\'t be blank ';
			}
			return new SPClientForms.ClientValidation.ValidationResult(isError, errorMessage);
		};
	}

	function parseValue(value, config) {
		config = config || {};

		value = value.replace(/<br\s*\/?>/g, '\n');
		value = value.replace(/<.+?>/g, '');
		value = _.unescape(value);

		if (config.json) {
			value = JSON.parse(value || 'null');
		}

		return value;
	}

	function stringifyValue(value, config) {
		config = config || {};

		if (config.json) {
			value = JSON.stringify(value || null);
		}

		return value || '';
	}

	var getComponentHtml = _.template('<${ tag } id="${ id }" params="${ params }"></${ tag }>');

	koSharepoint.useComponentForField = function useComponentForField(config) {
		config = _.defaults(config, {
			json: false,
			params: null,
		});

		var fieldInternalName = config.fieldInternalName;
		var controlId = 'id' + fieldInternalName + 'Control';
		var componentName = config.component;

		function getFieldValidators(formCtx) {
			var fieldValidators = new SPClientForms.ClientValidation.ValidatorSet();

			if (formCtx.fieldSchema.Required) {
				fieldValidators.RegisterValidator(new KoRequiredFieldValidator(fieldInternalName));
			}

			fieldValidators.RegisterValidator(new KoErrorsFieldValidator(fieldInternalName));

			return fieldValidators;
		}

		function getAdditionalParams(schema) {
			if (_.isFunction(config.params)) {
				return config.params(schema);
			}
			if (_.isObject(config.params) && !_.isArray(config.params)) {
				return config.params;
			}
			return {};
		}

		function getParamsString(params) {
			return _(params)
				.keys()
				.map(function (item) {
					return item + ': ' + item;
				})
				.value()
				.join(', ');
		}

		function customFieldTemplate(renderCtx, editable) {
			var formCtx = SPClientTemplates.Utility.GetFormContextForCurrentField(renderCtx);
			var oldFieldValue = formCtx.fieldValue;
			var fieldSchema = formCtx.fieldSchema;

			var paramsViewModel = _.defaults({
				fieldInternalName: fieldInternalName,
				value: parseValue(oldFieldValue, config),
				editable: editable,
			}, getAdditionalParams(fieldSchema));

			formCtx.registerInitCallback(fieldInternalName, function () {
				ko.koSharepointlyBindings(paramsViewModel, document.getElementById(controlId));
			});

			formCtx.registerGetValueCallback(fieldInternalName, function getValue() {
				var viewModel = getFieldModelInstance(fieldInternalName);

				if (!viewModel) {
					return oldFieldValue;
				}

				return stringifyValue(viewModel.getData(), config);
			});

			formCtx.registerValidationErrorCallback(fieldInternalName, function (errorResult) {
				// jscs:disable
				SPFormControl_AppendValidationErrorMessage(controlId, errorResult); // jshint ignore:line
				// jscs:enable
			});

			formCtx.registerClientValidator(fieldInternalName, getFieldValidators(formCtx));

			return getComponentHtml({
				tag: componentName,
				id: controlId,
				params: getParamsString(paramsViewModel)
			});
		}

		var overrideCtx = {
			Templates: {
				Fields: {}
			}
		};
		overrideCtx.Templates.Fields[fieldInternalName] = {
			NewForm: function (ctx) {
				return customFieldTemplate(ctx, true);
			},
			EditForm: function (ctx) {
				return customFieldTemplate(ctx, true);
			},
			DisplayForm: function (ctx) {
				return customFieldTemplate(ctx, false);
			},
		};
		SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
	};

	var fieldViewModelLoader = {
		loadViewModel: function (name, viewModelConfig, callback) {
			if (typeof viewModelConfig === 'function') {
				var ViewModel = viewModelConfig;
				viewModelConfig = {
					createViewModel: function (params) {
						var instance = new ViewModel(params);
						if (params.fieldInternalName) {
							setFieldModelInstance(params.fieldInternalName, instance);
						}
						return instance;
					}
				};
				ko.components.defaultLoader.loadViewModel(name, viewModelConfig, callback);
			} else {
				callback(null);
			}
		}
	};

	var templateFromUrlLoader = {
		loadTemplate: function loadTemplate(name, templateConfig, callback) {
			if (templateConfig.fromUrl) {
				var fullUrl = koSharepoint.settings.layoutsUrl + templateConfig.fromUrl;

				$.get(fullUrl, function (markupString) {
					ko.components.defaultLoader.loadTemplate(name, markupString, callback);
				});
			} else {
				callback(null);
			}
		}
	};

	ko.components.loaders.unshift(fieldViewModelLoader);
	ko.components.loaders.unshift(templateFromUrlLoader);

	return koSharepoint;
})(_, jQuery, ko);
