/*
 * Part of mcwebb/angular-twilio
 * Coypyright 2015 Matthew Webb <matthewowebb@gmail.com>
 * MIT License
 */
angular.module('mcwebb.twilio', [])
.provider('Twilio', function () {
	var apiEndpoint, credentials, accounts;

	apiEndpoint = 'https://api.twilio.com/2010-04-01/';

	credentials = {
		accountSid: '',
		authToken: ''
	};

	accounts = {
		_default: ''
	};

	this.setCredentials = function (o) {
		credentials.accountSid = o.accountSid;
		accounts._default = o.accountSid;
		credentials.authToken = o.authToken;
	};

	this.setAccounts = function (o) {
		for (var key in o) {
			if (key === '_default')
				throw 'cannot add "_default" account, it\'s used internally';
			else accounts[key] = o[key];
		}
	};

	this.$get = function ($window, $http) {
		var credentialsB64,
			internal = {};

		credentialsB64 = $window.btoa(
			credentials.accountSid + ':' + credentials.authToken
		);

		internal.transformResourceUrl = function (url) {
			if (url.substr(-1) === '/')
				url = url.substr(0, url.length - 1);
			return url + '.json';
		};

		internal.transformRequest = function (data, getHeaders) {
			// If this is not an object, defer to native stringification.
			if (!angular.isObject(data)) {
				return (data === null) ? '' : data.toString();
			}

			var buffer = [];
			// Serialize each key in the object.
			for (var name in data) {
				if (!data.hasOwnProperty(name)) continue;
				var value = data[name];
				buffer.push(
					encodeURIComponent(name) +
					'=' +
					encodeURIComponent((value === null) ? '' : value )
				);
			}

			// Serialize the buffer and clean it up for transportation.
			var source = buffer
				.join('&')
				.replace(/%20/g, '+')
			;

			return source;
		};

		internal.generateRequest = function (method, resource, data, account) {
			method = method.toUpperCase();

			if (!angular.isString(account) || account.length < 1)
				account = '_default';
			resource = 'Accounts/' +
				accounts[account] + '/' +
				internal.transformResourceUrl(resource)
			;

			var request = {
				method: method,
				url: apiEndpoint + resource,
				headers: {
					'Authorization': 'Basic ' + credentialsB64
				}
			};
			
			if (method === 'POST' || method === 'PUT') {
				if (data) request.data = data;
				request.transformRequest = internal.transformRequest;
				request.headers['content-type'] = 'application/x-www-form-urlencoded; charset=utf-8';
			} else if (data) {
				request.params = data;
			}
			return $http(request);
		};

		internal.create = function (resource, data, account) {
			return internal.generateRequest('POST', resource, data, account);
		};

		internal.read = function (resource, data, account) {
			return internal.generateRequest('GET', resource, data, account);
		};

		internal.update = function (resource, data, account) {
			return internal.generateRequest('PUT', resource, data, account);
		};

		internal.remove = function (resource, account) {
			return internal.generateRequest('DELETE', resource, null, account);
		};

		return {
			create:	internal.create,
			read:	internal.read,
			update:	internal.update,
			remove:	internal.remove
		};
	};
});
