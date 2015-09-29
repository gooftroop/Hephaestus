import _ from "lodash";
import {
    IllegalArgumentException
}
from "exceptions";

/**
 * Observer
 *
 * <description>
 */
class Observer {

    /**
     * <description>
     * @param  {[type]}
     * @param  {...[type]}
     * @return {[type]}
     */
    update(observable, ...args) {
        return this;
    };

    /**
     * <description>
     * @param  {[type]}
     * @return {[type]}
     */
    observe(observable) {
        if (!_.has(observable, "register_observer"))
            throw new exceptions.IllegalArgumentException("An non-observable object cannot be observed");
        observable.register_observer(this, (context || this));
        return this;
    };

    /**
     * <description>
     * @param  {[type]}
     * @return {[type]}
     */
    unobserve(observable) {
        if (!_.has(observable, "unregister_observer"))
            throw new exceptions.IllegalArgumentException("An non-observable object cannot be unobserved");
        observable.unregister_observer(this);
        return this;
    };
}

export Observer;

/**
 * Observable
 *
 * <description>
 */
class Observable {

    /**
     * Instantiate the Observable object and create the observer mapping.
     */
    constructor() {
        this._observers = {};
    };

    /**
     * <description>
     * @return this 		The current context.
     */
    setChanged() {
        // What to do with this?
    };

    /**
     * <description>
     * @param  Array 		The n-length parameters to notify the observers with.
     * 						The parameters will be passed to each observer's update
     * 						method in order provided to notify.
     * @return this 		The current context.
     */
    notify(...args) {
        var key, observer, ctx;
        // do somethign with setChanged?
        for (key in this._observers) {
            observer = this._observers[key].observer;
            ctx = this._observers[key].context;
            observer.update.apply(ctx, args);
        }
        return this;
    };

    /**
     * <description>
     * @param  observer 	The observer to register for notify callbacks. The
     * 						observer must have a UID.
     * @param  context 		(optional). The context in which to bind the observer's
     * 						update method.
     * @return this 		The current context.
     */
    register_observer(observer, context) {
        var key, id = observer.uid;
        for (key in this._observers) {
            if (key !== id) {
                this._observers[id] = {
                    observer: observer,
                    context: context || this
                }
            }
        }
        return this;
    };

    /**
     * <description>
     * @param  observer 	The observer to unregister for notify callbacks. The
     * 						observer must have a UID.
     * @return this 		The current context.
     */
    unregister_observer(observer) {
        var key, id = observer.uid;
        for (key in this._observers) {
            if (key === id) {
                delete this._observers[key];
            }
        }
        return this;
    };
}

export Observable;

class DOMObserver {

    getInstance() {
        if (!this.__instance__) {
            this.__instance__ = this.__create__();
        }
        return this.__instance__;
    };

    on(domElementName, options) {
    	// TODO if still loading, defer this
    	// TODO allow for observing multiple
    	// TODO does defaults do ok with options == null?
    	_.defaults(options, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: false
        });
    	this.__observer__.observe(domElementName, options);
    };

    off(domElementName) {
    	// TODO if loading or no 'on' for domElementName exists, do nothing
    	// TODO allow for observing multiple
    	this.__observer__.disconnect();
    };

    _create() {
        if (this._instance) {
            return;
        }

        // TODO don't forget about the deferred .on if loading
     	if (Modernizr) {
     		let self = this;
     		Modernizr.load({
     			test: Modernizer.mutationobserver,
     			nope: "utils/webcomponents.js",
     			complete: function() {
     				self._observer = self._MutationObserver();
     			}
     		});
     	} else {
     		if (!(window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver)) {
     			// load polyfill script manually.
     		}
            this._observer = this._MutationObserver();
     	}
    };

    _MutationObserver() {
        return new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (!mutation.addedNodes) return
                let node, i = 0, len =  mutation.addedNodes.length;
                for (; i < len; i++) {
                	// TODO complete implementation
                    var node = mutation.addedNodes[i]
                }
            })
        })
    };
}