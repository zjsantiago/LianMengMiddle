// MMPlugin.send('zhushou360://type=apk&name=%E5%8D%B0%E8%B1%A1%E7%AC%94%E8%AE%B0&dtype=soft&op=0&icon=http://p4.qhimg.com/t017f93d0e37eddcd7e.png&url=http://shouji.360tpcdn.com/360sj/dev/20130724/com.evernote.world_15210_145010.apk');
var MMPlugin = (function(minVersion, maxPluginReadyTime) {
	// 检测软件管家接口
	function getSMActiveX() {
		var myObject = document.createElement('object');
		
		myObject.classid= "clsid:467B32FF-C688-40FF-95FC-C7C61247B0AA"; 
		try {
			myObject.GetVersion();
			return myObject;
		} catch(e) {
			return false;
		}
	}

	// 检测非IE浏览器下是否存在插件
	function isNPExist() {
		var pluginName  = '360MMPlugin'.toLowerCase(),
		plugins = window.navigator.plugins;

		for (var i = 0, len = plugins.length; i < len; i++) {
			var item = plugins[i];
			if (item.name.toLowerCase() == pluginName) {
				return item;
			}
		}

		return false;
	}

	// 检测到网盾存在或者插件存在，就认为安装了卫士
	function isWeishiInstalled() {
		return window.wdextcmd || getSMActiveX() || isNPExist();
	}

	// 获取IE插件
	function getIP(){
		// 是否网盾，网盾（IE）的API和非网盾的API部分不一致
		//（置顶分别是Call360MobileMgr(param, '')和CallMobileMgrWithParam(param)；但是 Get360MobileMgrVer(0) 和 Call360MobileMgr_LP(param, '') 又是一致！）
		// 所以以前的版本是做了区分: plugin = (plugin.iswd && plugin.target) || plugin;
		if (window.wdextcmd && typeof wdextcmd.Call360MobileMgr != "unknown"){
			return window.wdextcmd;
		} else {
			var e = document.createElement("object");
			// IE8，新安装完卫士、不重启浏览器，IE8出黄色提示条：“加载项”。报错：“ 拒绝访问。”
			// 运行后，还是检测不到
			e.classid = "clsid:467B32FF-C688-40FF-95FC-C7C61247B0AA";
			return e;
		}
	}

	// 获取非IE插件
	var embed;
	function getNP() {
		if( !embed ){
			createEmbed();
		}

		return embed;
	}
	function createEmbed() {
		var div = document.createElement('div');
		div.style.visibility = 'hidden';
		div.style.position = 'absolute';
		div.style.zIndex = '-1';
		div.style.top = '-100px';

		var _embed;

		_embed = document.createElement( 'embed' );
		_embed.id = 'pluginId';
		_embed.type = 'application/x360mmplugin';

		div.appendChild( _embed );
		document.body.appendChild(div);
		div = null;

		embed = _embed;
	}
	
	// 
	function getPlugin() {
		// plugin = (plugin.iswd && plugin.target) || plugin; // 改造了getIP()，从而 plugin =plugin.target 这种晦涩的代码还是少些
		return window.ActiveXObject ? getIP() : getNP();
	}
	
	// null undefined String
	function getVersion() {
		var version = null;
		// console.log("isWeishiInstalled():", !!isWeishiInstalled());
		if( isWeishiInstalled() ){
			try {
				var plugin = getPlugin();
				// 安装了卫士，没有安装手助，返回 undefined
				// IE 有延迟，过早调用会导致 TypeError: 对象不支持“Get360MobileMgrVer”属性或方法
				// console.log('version = ' + plugin.Get360MobileMgrVer(0));
				return plugin.Get360MobileMgrVer(0);
			} catch( e ) {
				// console.log(e, e.message);
			}
		}

		return version;
	}

	function versionCompare(v1, v2) {
		var v1s = v1.split( '.' ),
			v2s = v2.split( '.' ),
			len1 = v1s.length,
			len2 = v2s.length;
		for (var i = 0; i < len1; i++) {
			// V1前面和V2都相同，但是V1后面还有数字，说明V1版本更高
			if (i > len2 - 1) {
				return 1;
			}
			
			if (v1s[i] > v2s[i]) {
				return 1;
			} else if (v1s[i] < v2s[i]) {
				return -1;
			}
		}
		
		// V1前面和V2都相同，但是V2后面还有数字，说明V2版本更高
		if (len1 < len2) {
			return -1;
		}
		
		return 0;
	}
	
	function formatUrl(url) {
		if (typeof url !== 'string') {
			return '';
		}
		return url.replace(/(name=[^&]*)/, function(str, p1) {return p1 + '&quiet=1&src=leidian';});
	}
	
	// 对批量安装中可能出现的name字段重名进行添加随机数的唯一性处理
	function distinct( arr ) {
		var str = 'name=',
			reg = /name=([^&]+)&/,
			len = arr.length,
			obj = {},
			i = 0,
			startIndex, endIndex, item, name;
			
		for( ; i < len; i++ ){
			item = arr[i];
			startIndex = item.indexOf( str );
			endIndex = item.indexOf( '&', startIndex );
			
			if( !~endIndex ){
				endIndex = item.length;
			}
			
			name = item.slice( startIndex + 5, endIndex );
			
			if( !obj[name] ){
				obj[ name ] = true;
			}
			else{
				name += '_' + ( (Math.random() + '').slice(-8) - 0 + (+new Date()) ).toString(36);
				obj[ name ] = true;
				item = item.replace( reg, function( $, $1 ){
					return 'name=' + name + '&';
				});
				arr[i] = item;
			}
		}    

		return arr;
	}

	return {
		ready: function( cb ) {
			var time = 100,
				timeElapsed = 0,
				timerId = setInterval(function() {
					var version = getVersion();
					// version 为 null 时，表示没有检测到卫士，或者 Get360MobileMgrVer(0) 方法还不能调用
					if (version !== null) {
						clearInterval(timerId);
						// version 可能为 undefined
						// 1. 非windows  NotificationManager.notWindows()
						// 2. version 不是字符串: 没有检测到 助手接口 NotificationManager.mmNotInstalled()
						// 3. version 是一个字符串 检测到助手接口，但是版本太低 NotificationManager.mmTooOld()
						cb(versionCompare(version, minVersion) >= 0);
						return;
					}

					if (timeElapsed > maxPluginReadyTime) {
						clearInterval(timerId);
						cb(false);
						return;
					}
					timeElapsed += time;
				}, time);
		},
		/*
		isSupported: function() {
			var version = getVersion();
			if (!version) {
				return false;
			}
			
			return (!!version && versionCompare(version, minVersion) >= 0);
		},
		*/
		send: function(href) {
			if (typeof href === 'string') {
				href = [href];
			}

			var hrefs = [];
			for (var i = 0, len = href.length, url; i < len; i++) {
				url = formatUrl(href[i]);
				if (url) {
					hrefs.push(url);
				}
			}

			// 保证名字唯一（重名的加随机字符串）
			hrefs = distinct( hrefs );

			var plugin = getPlugin();
			try {
				while (hrefs.length > 0) {
					plugin.Call360MobileMgr_LP('-e ' + hrefs.splice(0, 30).join( '\n-e ' ) + '\n', '');
				}
			} catch(e) {}
		}
	}
})('2.0.0.2185', 5000);