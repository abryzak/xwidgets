function package(fullName) {
  var i;
  var pkg = window;
  var parts = fullName.split(".");
  for (i = 0; i < parts.length; i++) {
    if (typeof pkg[parts[i]] === "undefined") {
      pkg[parts[i]] = {};
    }
    pkg = pkg[parts[i]];
  }
}

xw = {};

//
// Constants
//
xw.CORE_NAMESPACE = "http://xwidgets.org/core";
xw.XHTML_NAMESPACE = "http://www.w3.org/1999/xhtml";

//
// Browser info - based on Prototype JS
//
xw.Browser = function() {
  var ua = navigator.userAgent;
  var isOpera = Object.prototype.toString.call(window.opera) === '[object Opera]';
  return {
    IE:             !!window.attachEvent && !isOpera,
    Opera:          isOpera,
    WebKit:         ua.indexOf('AppleWebKit/') > -1,
    Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
    MobileSafari:   /Apple.*Mobile.*Safari/.test(ua)
  };
};

//
// System Utils
//
xw.Sys = {};

xw.Sys.getObject = function(id) {
  if (document.getElementById && document.getElementById(id)) {
    return document.getElementById(id);
  } else if (document.all && document.all(id)) {
    return document.all(id);
  } else if (document.layers && document.layers[id]) {
    return document.layers[id];
  } else {
    return false;
  }
};

xw.Sys.createHttpRequest = function(mimeType) {
  if (window.XMLHttpRequest) {
    var req = new XMLHttpRequest();
    if (mimeType !== null && req.overrideMimeType) {
      req.overrideMimeType(mimeType);
    }
    return req;
  }
  else {
    return new ActiveXObject("Microsoft.XMLHTTP");
  }
};

//
// Asynchronously loads the javascript source from the specified url
//
xw.Sys.loadSource = function(url, callback) {
  var req = xw.Sys.createHttpRequest("text/plain");
  req.onreadystatechange = function() {
    if (req.readyState === 4) {
      if (req.status === 200 || req.status === 0) {
        var e = document.createElement("script");
        e.language = "javascript";
        e.text = req.responseText;
        e.type = "text/javascript";
        var head = document.getElementsByTagName("head")[0];
        if (head === null) {
          head = document.createElement("head");
          var html = document.getElementsByTagName("html")[0];
          html.insertBefore(head, html.firstChild);
        }
        head.appendChild(e);
        if (callback) {
          callback();
        }
      }
    }
  };

  req.open("GET", url, true);
  req.send(null);
};

xw.Sys.newInstance = function(name) {
  var current, parts, constructorName;
  parts = name.split('.');
  constructorName = parts[parts.length - 1];
  current = window;
  for (var i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
  }
  return new current[constructorName]();
};

xw.Sys.isUndefined = function(value) {
  return value == null && value !== null;
};

xw.Sys.classExists = function(fqcn) {
  var parts = fqcn.split(".");
  var partial = "";
  var i;
  for (i = 0; i < parts.length; i++) {
    partial += (i > 0 ? "." : "") + parts[i];
    if (eval("typeof " + partial) === "undefined") return false;
  }
  
  return eval("typeof " + fqcn) === "function";
};

xw.Sys.arrayContains = function(arrayVal, value) {
  var i;
  for (i = 0; i < arrayVal.length; i++) {
    if (arrayVal[i] === value) {
      return true;
    }
  }
  return false;
};

xw.Sys.capitalize = function(value) {
  return value.substring(0, 1).toUpperCase() + value.substring(1, value.length);
};

xw.Sys.chainEvent = function(ctl, eventName, eventFunc) {
  if (ctl.addEventListener) {
    // normal browsers like firefox, chrome and safari support this
    ctl.addEventListener(eventName, eventFunc, false);
  }
  else if (ctl.attachEvent) {
    // irregular browsers such as IE don't support standard functions
    ctl.attachEvent("on" + eventName, eventFunc);
  }
  else {
    // really old browsers
    alert("your browser doesn't support adding event listeners");
  }
};

//
// Returns the specified style for an element
// TODO - probably need to fix this up for safari - use xw.Sys.getBorder() as an example
//
xw.Sys.getStyle = function(element, cssRule) {
	var strValue = "";
	if (document.defaultView && document.defaultView.getComputedStyle) {
		strValue = document.defaultView.getComputedStyle(element, "").getPropertyValue(cssRule);
	}
	else if (element.currentStyle) {
		cssRule = cssRule.replace(/\-(\w)/g, function (strMatch, p1){
			return p1.toUpperCase();
		});
		strValue = element.currentStyle[cssRule];
	}
	return strValue;
};

xw.Sys.getBorder = function(control) {
  var border = {};
  if (window.navigator.userAgent.indexOf('Safari') === -1) {
    if (control.currentStyle) {
      border.top = parseInt(control.currentStyle.borderTopWidth, 10);
      border.right = parseInt(control.currentStyle.borderRightWidth, 10);
      border.bottom = parseInt(control.currentStyle.borderBottomWidth, 10);
      border.left = parseInt(control.currentStyle.borderLeftWidth, 10);
    }
    else {
      try {
        border.top = parseInt(getComputedStyle(control,null).getPropertyValue('border-top-width'), 10);
        border.right = parseInt(getComputedStyle(control,null).getPropertyValue('border-right-width'), 10);
        border.bottom = parseInt(getComputedStyle(control,null).getPropertyValue('border-bottom-width'), 10);
        border.left = parseInt(getComputedStyle(control,null).getPropertyValue('border-left-width'), 10);
      }
      // last resort
      catch (e) {
        border.top = parseInt(control.style.borderTopWidth, 10);
        border.right = parseInt(control.style.borderRightWidth, 10);
        border.bottom = parseInt(control.style.borderBottomWidth, 10);
        border.left = parseInt(control.style.borderLeftWidth, 10);
      }
    }
  }
  else {
    border.top = parseInt(control.style.getPropertyValue('border-top-width'), 10);
    border.right = parseInt(control.style.getPropertyValue('border-right-width'), 10);
    border.bottom = parseInt(control.style.getPropertyValue('border-bottom-width'), 10);
    border.left = parseInt(control.style.getPropertyValue('border-left-width'), 10);
  }
  return border;
};

xw.Sys.parseXml = function(body) {
  var doc;
  try {
    doc = new ActiveXObject("Microsoft.XMLDOM");
    doc.async = "false";
    doc.loadXML(body);
    return doc;
  }
  catch (e) {
    doc = new DOMParser().parseFromString(body, "text/xml");
    return doc;
  }
};

//
// A Map implementation
//
xw.Map = function() {
  this.elements = [];

  xw.Map.prototype.size = function() {
    return this.elements.length;
  };

  xw.Map.prototype.isEmpty = function() {
    return this.elements.length === 0;
  };

  xw.Map.prototype.keySet = function() {
    var i;
    var keySet = [];
    for (i = 0; i < this.elements.length; i++) {
      keySet.push(this.elements[i].key);
    }
    return keySet;
  };

  xw.Map.prototype.values = function() {
    var i;
    var values = [];
    for (i = 0; i < this.elements.length; i++) {
      values.push(this.elements[i].value);
    }
    return values;
  };

  xw.Map.prototype.get = function(key) {
    var i;
    for (i = 0; i < this.elements.length; i++) {
      if (this.elements[i].key === key) {
        return this.elements[i].value;
      }
    }
    return null;
  };

  xw.Map.prototype.put = function(key, value) {
    var i;
    for (i = 0; i < this.elements.length; i++) {
      if (this.elements[i].key === key) {
        this.elements[i].value = value;
        return;
      }
    }
    this.elements.push({key:key,value:value});
  };

  xw.Map.prototype.remove = function(key) {
    var i;
    for (i = 0; i < this.elements.length; i++) {
      if (this.elements[i].key === key) {
        this.elements.splice(i, 1);
      }
    }
  };

  xw.Map.prototype.contains = function(key) {
    var i;
    for (i = 0; i < this.elements.length; i++) {
      if (this.elements[i].key === key) {
        return true;
      }
    }
    return false;
  };
};

//
// Contains metadata about a view node that represents an event
//
xw.EventNode = function(type, script) {
  this.type = type;
  this.script = script;
};

//
// Contains metadata about a view node that represents a widget
//
xw.WidgetNode = function(fqwn, attributes, children) {
  this.fqwn = fqwn;
  this.attributes = attributes;
  this.children = children;
};

//
// Contains metadata about a view node that represents a native html control
//
xw.XHtmlNode = function(children) {
  this.children = children;
};

//
// Parses an XML-based view and returns the view root node
//
xw.ViewParser = function() {

  xw.ViewParser.prototype.parse = function(viewRoot) {
    var rootNode = new xw.WidgetNode(this.getFQCN(viewRoot), null, this.parseChildNodes(viewRoot.childNodes));
    return rootNode;
  };

  xw.ViewParser.prototype.parseUri = function(uri) {
    var i;
    var partNames = ["source","protocol","authority","domain","port","path","directoryPath","fileName","query","anchor"];
    var parts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)?((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(uri);
    var result = {};

    for (i = 0; i < 10; i++) {
      result[partNames[i]] = (parts[i] ? parts[i] : "");
    }

    if (result.directoryPath.length > 0) {
      result.directoryPath = result.directoryPath.replace(/\/?$/, "/");
    }

    return result;
  };

  xw.ViewParser.prototype.getFQCN = function(e) {
    var uri = this.parseUri(e.namespaceURI);
    var i;
    var fp = "";
    var parts = uri.domain.split(".");
    for (i = parts.length - 1; i >=0; i--) {
      fp += parts[i];
      if (i > 0) {
        fp += "/";
      }
    }
    fp += uri.directoryPath + xw.Sys.capitalize(e.localName);
    return fp.replace(/\//g, ".");
  };

  xw.ViewParser.prototype.parseChildNodes = function(children) {
    var nodes = [];
    var i, j;

    for (i = 0; i < children.length; i++) {
      var e = children.item(i);

      // TODO If this is an XHTML element, it gets parsed differently
      if (e.namespaceURI === xw.XHTML_NAMESPACE) {
        nodes.push(new xw.XHtmlNode());
      }
      else {
        // Only process elements
        if (e.nodeType === 1) {
          var attributes = {};
  
          // Read the attributes
          for (j = 0; j < e.attributes.length; j++) {
            var n = e.attributes[j].name;
            attributes[n] = e.getAttribute(n);
          }
  
          if (e.namespaceURI === xw.CORE_NAMESPACE && e.localName === "event") {
            var event = this.parseEvent(e);
            if (event) {              
              nodes.push(event);
            }
          }
          else {
            nodes.push(new xw.WidgetNode(this.getFQCN(e), attributes, this.parseChildNodes(e.childNodes)));
          }
        }
      }
    }
    return nodes;
  };

  //
  // Parses an XML element that contains an event definition and extracts the event type and script
  // which are then returned as an EventNode instance.
  xw.ViewParser.prototype.parseEvent = function(e) {
    var i, j, script;
    var eventType = e.getAttribute("type");
    for (i = 0; i < e.childNodes.length; i++) {
      var child = e.childNodes.item(i);

      if (child.nodeType === 1 && 
          child.namespaceURI === xw.CORE_NAMESPACE && 
          child.localName === "action" && 
          child.getAttribute("type") === "script") {
        // get all the text content of the action node, textContent would be easier but IE doesn't support that
        script = "";
        for (j = 0; j < child.childNodes.length; j++) {
          var grandChild = child.childNodes[j];
          var nodeType = grandChild.nodeType;
  
          // not TEXT or CDATA
          if (nodeType === 3 || nodeType === 4) {
            script += grandChild.nodeValue;
          }
        }
        return new xw.EventNode(eventType, script);
      }
    }
  }
};

//
// View manager - responsible for caching views
//
xw.ViewManager = {};

// A cache of view name:root view node values
xw.ViewManager.viewCache = {};

xw.ViewManager.openView = function(viewName, container) {
  // If we haven't previously loaded the view, do it now
  if (xw.Sys.isUndefined(xw.ViewManager.viewCache[viewName])) {
    var callback = function(req) {
      xw.ViewManager.loadViewCallback(req, viewName, container);
    };
    xw.ViewManager.loadView(viewName, callback);
  } else {    
    var definition = xw.ViewManager.viewCache[viewName];
    
    // It is up to the ViewManager to ensure that all of the widgets 
    // used by the view are loaded before it is rendered
    var invalid = [];
    xw.ViewManager.validateWidgets(definition.children, invalid);
    
    // If any invalid widgets were found, they need to be loaded before
    // rendering the view.
    if (invalid.length > 0) {
      xw.WidgetManager.loadWidgetsAndOpenView(invalid, viewName, container);      
    } else {
      xw.ViewManager.createView(viewName).render(container);
    }    
  }
};

//
// Creates an instance of the named view
//
xw.ViewManager.createView = function(viewName) {
  var view = new xw.View();
  var definition = xw.ViewManager.viewCache[viewName];
  
  xw.ViewManager.parseChildren(definition.children, view);
  
  return view;
};

xw.ViewManager.parseChildren = function(childNodes, parentWidget) {
  var i;
  var widgets = [];
  for (i = 0; i < childNodes.length; i++) {
    var c = childNodes[i];
    if (c instanceof xw.WidgetNode) {
      var widget = xw.Sys.newInstance(c.fqwn);
      
      for (var p in c.attributes) {
        widget[p] = c.attributes[p]; 
      }
      
      widgets.push(widget);
      if (!xw.Sys.isUndefined(c.children) && c.children.length > 0) {
        xw.ViewManager.parseChildren(c.children, widget);
      }
    }
  }  
  parentWidget.children = widgets;    
};

//
// Validate that the widgets used in the specified view are all loaded
// - any invalid widgets should be added to the specified 'invalid' array
//
xw.ViewManager.validateWidgets = function(children, invalid) {
  var i, fqwn;  
  for (i = 0; i < children.length; i++) {
     if (children[i] instanceof xw.WidgetNode) {
       fqwn = children[i].fqwn;
       if (!xw.Sys.classExists(fqwn)) {         
         if (!xw.Sys.arrayContains(invalid, fqwn)) {
           invalid.push(fqwn);
         }
       }
     }
     if (!xw.Sys.isUndefined(children[i].children)) {
       xw.ViewManager.validateWidgets(children[i].children, invalid);
     }
  }
}

//
// Loads the view definition from the server
//
xw.ViewManager.loadView = function(viewName, callback) {
  var req = xw.Sys.createHttpRequest("text/xml");
  req.onreadystatechange = function() { callback(req) };
  req.open("GET", viewName, true);
  req.send(null);
  return req;
};

xw.ViewManager.loadViewCallback = function(req, viewName, container)
{
  if (req.readyState === 4) {
    if (req.status === 200 || req.status === 0) {
      var viewRoot;
      if (req.responseXml) viewRoot = req.responseXML.documentElement;
      else if (req.responseText && req.responseText.length > 0) {
        viewRoot = xw.Sys.parseXml(req.responseText).documentElement;
      }

      if (viewRoot) {
        if (viewRoot.namespaceURI === xw.CORE_NAMESPACE && viewRoot.localName === "view") {
          
          // Parse the XML view definition and store it in the viewCache
          this.viewCache[viewName] = new xw.ViewParser().parse(viewRoot);
          xw.ViewManager.openView(viewName, container);
        }
        else {
          alert("Invalid view definition - document root '" + viewRoot.tagName +
            "' must be a 'view' element in namespace " + xw.CORE_NAMESPACE);
        }
      }
      else {
        alert("No view data received.  If you are loading from the local file system, the security model of some browsers (such as Chrome) might not support this.");
      }
    }
    else {
      alert("There was an error processing your request.  Error code: " + req.status);
    }
  };
};

//
// This class is responsible for loading the source code for widgets that have not been loaded already
//
xw.WidgetManager = {};

//
// Stores a list of view names that are to be rendered after the pending widgets are loaded
//
xw.WidgetManager.pendingViews = [];

//
// Stores a list of widgets to load
//
xw.WidgetManager.pendingWidgets = [];

//
// Load the widgets specified in the widgets array parameter, then open the specified view in
// the specified container 
//
xw.WidgetManager.loadWidgetsAndOpenView = function(widgets, viewName, container) {
  var i;
  for (i = 0; i < widgets.length; i++) {
    xw.WidgetManager.pendingWidgets.push(widgets[i]);
  }
  xw.WidgetManager.pendingViews.push({viewName: viewName, container: container});
  xw.WidgetManager.loadPendingWidgets();
};

xw.WidgetManager.loadPendingWidgets = function() {
  if (xw.WidgetManager.pendingWidgets.length > 0) {
    var fqwn = xw.WidgetManager.pendingWidgets.shift();
    var url = xw.getResourceBase() + fqwn.replace(/\./g, "/").toLowerCase() + ".js";    
    
    var callback = function() {
      // We're forced to do this because some browsers are buggy (I'm looking at YOU Firefox!)
      // when it comes to initializing functions defined by dynamically imported JavaScript
      xw.Sys.newInstance(fqwn);
      
      xw.WidgetManager.loadPendingWidgets();
    };
    
    xw.Sys.loadSource(url, callback);    
  } else {
    // Render any pending views
    while (xw.WidgetManager.pendingViews.length > 0) {
      var v = xw.WidgetManager.pendingViews.shift();      
      var view = xw.ViewManager.createView(v.viewName);
      view.render(v.container); 
    }
  }
};
  
//
// A single instance of a view
//
xw.View = function() {
  this.children = [];

  this.layout = null;
  
  // The container control
  this.container = null;

  //
  // Callback for window resize events
  //
  xw.View.prototype.resize = function() {
    // bubble the resize event through the component tree
  };

  xw.View.prototype.setLayout = function(layout) {
    if ("string" === (typeof layout)) {
      this.layoutManager = new xw.layoutManagers[layout](this);
    } else {
      this.layoutManager = layout;
    }
  };

  xw.View.prototype.render = function(container) {
    var i;
    
    // Determine the container control
    this.container = ("string" === (typeof container)) ? xw.Sys.getObject(container) : container;

    // Set the window resize callback so that we can respond to resize events
    var target = this;
    var callback = function() { target.resize(); };
    xw.Sys.chainEvent(window, "resize", callback);

    // Create the appropriate layout manager and layout the child controls
    if (this.layout !== null) {
      // TODO set the layoutManager based on the value of layout
      this.layoutManager = new xw.BorderLayout();
      this.layoutManager.layout(this.container, this.children);
    }    
    
    for (i = 0; i < this.children.length; i++) {
      this.children[i].render(this.container);
    }
  };

  xw.View.prototype.appendChild = function(child) {
    this.container.appendChild(child);
  };
};

//
// LAYOUT MANAGERS
//

xw.BorderLayout = function() {
  this.bounds = new xw.Map();

  xw.BorderLayout.prototype.layout = function(container, widgets) {
    var i;
    var controls = {      
      top: [],
      bottom: [],
      left: [],
      right: [],
      client: [] 
    };
    var spacing = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    };

    // TODO - support percentage widths

    container.style.position = "relative";

    for (i = 0; i < widgets.length; i++) {
      var w = widgets[i];
      if (controls[w.align]) {
        controls[w.align].push(w);
      }
    }

    for (i = 0; i < controls.top.length; i++) {
      var bounds = new xw.Bounds(null, null, controls.top[i].height, null)
        .addStyleProperty("position", "absolute")
        .addStyleProperty("top", spacing.top + "px")
        .addStyleProperty("left", "0")
        .addStyleProperty("right", "0");

      this.bounds.put(controls.top[i], bounds);
      spacing.top += 1.0 * controls.top[i].height;
    }

    for (i = 0; i < controls.bottom.length; i++) {
      var bounds = new xw.Bounds(null, null, controls.bottom[i].height, null)
        .addStyleProperty("position","absolute")
        .addStyleProperty("bottom", spacing.bottom)
        .addStyleProperty("left", "0")
        .addStyleProperty("right", "0");

      this.bounds.put(controls.bottom[i], bounds);
      spacing.bottom += 1.0 * controls.bottom[i].height;
    }

    for (i = 0; i < controls.left.length; i++) {
      this.bounds.put(controls.left[i], new xw.Bounds(null, null, null, controls.left[i].width)
        .addStyleProperty("position", "absolute")
        .addStyleProperty("left", spacing.left + "px")
        .addStyleProperty("top", spacing.top + "px")
        .addStyleProperty("bottom", spacing.bottom + "px")
      );
      spacing.left += 1.0 * controls.left[i].width;
    }

    for (i = 0; i < controls.right.length; i++) {
      this.bounds.put(controls.right[i], new xw.Bounds(null, null, null, controls.right[i].width)
        .addStyleProperty("position", "absolute")
        .addStyleProperty("right", spacing.right + "px")
        .addStyleProperty("top", spacing.top + "px")
        .addStyleProperty("bottom", spacing.bottom + "px")
      );
      spacing.right += 1.0 * controls.right[i].width;
    }

    for (i = 0; i < controls.client.length; i++) {
      this.bounds.put(controls.client[i], new xw.Bounds(null, null, null, null)
        .addStyleProperty("position", "absolute")
        .addStyleProperty("left", spacing.left + "px")
        .addStyleProperty("right", spacing.right + "px")
        .addStyleProperty("top", spacing.top + "px")
        .addStyleProperty("bottom", spacing.bottom + "px")
      );
    }
  };

  xw.BorderLayout.prototype.getBounds = function(ctl) {
    return this.bounds.get(ctl);
  };
};

//
// Defines the physical bounds of a control
//
xw.Bounds = function(top, left, height, width) {
  this.top = top;
  this.left = left;
  this.height = height;
  this.width = width;
  this.style = new Object();
  
  xw.Bounds.prototype.getTop = function() {
    return this.top;
  };
  
  xw.Bounds.prototype.getLeft = function() {
    return this.left;
  };
  
  xw.Bounds.prototype.getHeight = function() {
    return this.height;
  };
  
  xw.Bounds.prototype.getWidth = function() {
    return this.width;
  };
  
  xw.Bounds.prototype.addStyleProperty = function(property, value) {
    this.style[property] = value;
    return this;
  };
};

//
// Base class for widgets
//
xw.Widget = function() {
  this.parent = null;
  this.children = [];
  
  xw.Widget.prototype.setParent = function(parent) {
    this.parent = parent;
  };
  
  xw.Widget.prototype.render = function() {
    alert("Error - this widget must provide an implementation of the render() method");
  };
};

//
// GENERAL METHODS
//

//
// Opens a view in the specified container - this call is asynchronous
//
xw.openView = function(viewName, container) {
  xw.ViewManager.openView(viewName, container);
};

xw.setResourceBase = function(resourceBase) {
  xw.resourceBase = resourceBase;
};

xw.getResourceBase = function() {
  return xw.Sys.isUndefined(xw.resourceBase) ? "" : xw.resourceBase + "/";
};