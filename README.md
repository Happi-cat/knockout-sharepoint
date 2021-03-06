# Knockout for Sharepoint

This library provides mechanism that will help you use knockout in SharePoint for field rendering


## Documentation

This library expose next API:


#### koSharepoint.settings.layoutsFolderUrl: 

This variable containts relative url where loader will search for template when you're using fromUrl loader.

#### koSharepoint.settings.fileVersion:

This variable containt file version that will be appended as a query param when you're using fromUrl loader.
Example: `/_layout/15/someproject/templates/file.html?v=fileVersion`

#### koSharepoint.CustomValidators: 

This namespace contains client validators that can be used with ko.
		

#### koSharepoint.fields

This object contains instantiated component view models that are used for field rendering.


#### koSharepoint.useComponentForField

If you want to use knockout registered component you should call this methods before field rendered and provide options to it:

Options can have next properties:

property name |   | description
--------------|---|--------------
fieldInternalName | **required** | SharePoint field internal name
component         | **required** | registered knockout component name
json              | **optional** | this boolean option can be used for fields that stores information in JSON format. You can access JS object in component view model constructor by params.value.
params            | **optional** | you can specify object with additional parameters that should be passed to knockout component. This option can be function (i.e. `function (schema) { return {}; }` ) that receive field schema as an argument and return object with additional parameters.


## Knockout component view model requirements

Component view model receives params object with next properties. 
- fieldInternalName - field internal name
- editable - boolean that is set to true for NewForm, EditForm
- value - contains field value
- additional options that were specified.

View model instance should have **getData** function, that will be called on form submit for getting new value (if it's a json field you should return JS object that would be converted to string automatically).

If you want to use custom validation you can specify **hasErrors** function. It should return message string when field is invalid, otherwise it should return falthy value.

## Usage


### Register all scripts before 

- lodash 
- knockout
- jQuery
- ko-sharepoint 

### Initialize koSharepoint library if it's required

```javascript
	(function (koSharepoint) {
		koSharepoint.settings.layoutsUrl = '/_layouts/15/MySolution.CurrentProject';
	})(koSharepoint);
```


### Register all knockout components

You should register all knockout components before usage like in example below:

```javascript
	ko.components.register('my-component', {
		viewModel: MyComponentViewModel,
		template: '<span data-bind="text: value"></span>',
	});

```

*NOTE:* if you want to use component for list field rendering you should specify **viewModel** property and pass constructor to it.


### Use component for field rendering

You can specify JSLink script with next content:

```javascript
	koSharepoint.useComponentForField({
		fieldInternalName: 'FieldInternalName',
		component: 'my-component',
		json: true,
	});

```

If you want to pass additional params to viewModel:

```javascript
	koSharepoint.useComponentForField({
		fieldInternalName: 'FieldInternalName',
		component: 'currency',
		params: {
			negativeDisabled: true
		}
	});
```

If you need to get values for choice field from schema you can do next:

```javascript
	koSharepoint.useComponentForField({
		fieldInternalName: 'FieldInternalName',
		component: 'currency',
		params: function (fieldSchema) {
			return { /* everything you need */ }
		}
	});
```

