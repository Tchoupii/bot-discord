const axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
axios.defaults.withCredentials = true
axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

var Service = {
	url:null,
	call: function(service, method, args = []) {
		console.log('Call '+service+':'+method+' with ',args)
		return axios.post(this.url, {
			'service': service,
			'method': method,
			'args': args
		},{
			jar: cookieJar
		}).then(function(response) { 
			if (typeof response.data != 'object')
				throw new Error('Incorrect answer from server');				
			if (response.data.type == 'error')
				throw new Error(response.data.message);				
			console.log('THEN:'+service+' '+method)
			return response.data.result;
		}).catch(function(error) {
			console.log('CATCH:'+service+' '+method)			
			if (error.response && error.response.data) {
				console.log(error.response.data);
				error = error.response.data.message;				
			}
			else 
				error = error.message;						
			throw new Error(error);
		});
	},

	upload: function(fileList) {
		const formData = new FormData();
		if (!fileList || !fileList.length) return [];
		Array.from(Array(fileList.length).keys())
            .map(x => {
                formData.append('file'+x, fileList[x], fileList[x].name);
            });
		return this._upload(formData);
	},

	_upload: function(formData) {
		return axios.post('api/upload.php', formData)
		.then(function(response) {
			if (response.data.success == false)
				throw new Error(response.data.message);
			return response.data.files;
		}).catch(function(error) {
			if (error.response && error.response.data) {
				error = error.response.data.message;				
			}
			else 
				error = error.message;			
			throw new Error(error);
		});
	},

	init: function(url) {
		this.url = url;
		return axios.get(url+'?api').then(function(response) { 
			var services = response.data;
			var cls = Service;
			var service;
			for (service in services) {
				var target = cls[service];
				if (!target) 
					target = cls[service] = {};	
				for (let method of services[service]) {
					cls[service][method.name] = (function(service, method) {
						return function() {
							Service.call(service, method, [].slice.call(arguments))
						}
					})(service, method.name)
				}
			}
		})
	}
}

module.exports = Service;