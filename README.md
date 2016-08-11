# Angular Twilio Module
A simple Angular wrapper around Twilio's REST API

Technically all methods should be possible since with this module you simply specify the HTTP verb and API endpoint in the method call.
Having said that, not all methods have been tested.

## Installation
### Install with Bower
```bash
# from the terminal at the root of your project
bower install angular-twilio --save
```
### Add to your module deps
```js
angular.module('xxxx', ['mcwebb.twilio'])
```

## Example Use
### Set up
N.B. it's probably not a good idea to use this in a public website since your credentials are world readable.
```js
angular.module('xxxx')
.config(function (TwilioProvider) {
	TwilioProvider.setCredentials({
		accountSid: 'xxxx',
		authToken: 'xxxx'
	});
});
```

### Use
Each method returns a ```HttpPromise```, i.e. a promise from $http.
```js
angular.module('xxxx')
.controller('ExampleController', function ExampleController($scope, Twilio) {
	$scope.submit = function () {
		Twilio.create('Messages', {
			From: '+12402926537',
			To: '+16175551212',
			Body: 'This is a test! yay!'
		})
		.success(function (data, status, headers, config) {
			// Success - do something
		})
		.error(function (data, status, headers, config) {
			// Failure - do something
		});
	};
});
```
