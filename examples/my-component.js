;(function () {
	'use strict';

	function MyComponentViewModel(params) {
		var self = this;

		self.value = ko.observable(params.value);

		self.getData = function () {
			return self.value();
		};
	}

	ko.components.register('my-component', {
		viewModel: MyComponentViewModel,
		template: '<span data-bind="text: value"></span>',
	});

}());