package("org.xwidgets.core");

org.xwidgets.core.EventObserver = xw.NonVisual.extend({
  _constructor: function() {
    this._super();
    this.registerProperty("event", null);
    this.registerEvent("onFire", null);
    
    this.opened = false;    
  },
  open: function() {
    if (!this.opened) {
      this.opened = true;
      this.register();
    }
  },
  register: function() {
    if (typeof this.event === "string") {
      xw.Event.registerObserver(this.event, this);
    }
  },
  fire: function(params) {
    if (this.onFire) {
      this.onFire.invoke();
    }; 
  },
  setEvent: function(event) {
    if (typeof this.event === "string" && this.opened) {
      xw.Event.unregisterObserver(this);
    }
    this.event = event;
    
    if (this.opened) {
      this.register();
    }
  }
)};
