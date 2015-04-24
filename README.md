# Knockout for Sharepoint

This library provides mechanism that will help you use knockout in SharePoint for field rendering


## Documentation

This library expose next API:


#### layoutsFolderUrl: 

This variable containts relative url where ko will search for template when you're using fromUrl loader.


#### CustomValidators: 

This namespace contains client validators that can be used with ko.
		

#### fields

This object contains instantiated component view models that used for field rendering


#### useComponentForField

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
- fieldInternalName - fiedl internal name
- editable - boolean that is set to true for NewForm, EditForm
- value - contains field value
- additional options that were specified.


## Usage


### Register all scripts before 

- lodash 
- knockout
- jQuery
- ko-sharepoint 





### Register all knockout components

You should register all knockout components before usage like in example below:

```javascript
	ko.components.register('my-component', {
		viewModel: MyComponentViewModel,
		template: '<span data-bind="text: value"></span>',
	});

```

*NOTE:* if you want to use component for list field rendering you should specify viewModel and pass constructor to it.


### Use component for field rendering

You can specify JSLink script with next content:

```javascript
	koSharepoint.useComponentForField({
		fieldInternalName: 'FieldInternalName',
		component: 'my-component',
		json: true,
	});

```

