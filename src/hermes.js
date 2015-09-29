import _ from "lodash";
import io from "socket.io";
import {
    IllegalArgumentException, IllegalStateException
}
from "exceptions";

/*
What is it that I want this to do?
1. facilitate communications between modules
2. enable async, event-based action/reaction

I want a module to register to a channel and describe how it wants to receive information and in what format

*/

/**
 *
 */
class Hermes {

    // TODO make broadcaster/aggregator that accepts input
    // only question is how to map the results? I would guess a generator
    constructor() {
        this.EV_WS_SEP = /\s+/;
        this.EV_COMMA_SEP = /,\s+/;
        this.SUB_EV_SEP = ":";

        this._hosts = {};
        this._events = {};
    };

    /**************************************************************************
     * Events
     **************************************************************************/

    /**
     * <description>
     * @param  {[type]}
     * @param  {[type]}
     * @param  {[type]}
     * @return {[type]}
     */
    on(event, handler, context) {
        if (!event) throw new exceptions.IllegalArgumentException("event is required");
        if (!handler) throw new exceptions.IllegalArgumentException("handler is required");

        context = context || this;

        // TODO ... really only like to bind .on to a single function once - that way if 
        // on is called multiple times from the same caller with the same function we 
        // dont duplciate
        if (_.isObject(event)) {
            var ev, params;
            for (ev in event) {
                params = event[ev];
                this.on(ev, params.handler, params.context);
            }
            return this;
        }

        return this._onAPI(this._toArray(event), handler, context);
    };

    /**
     * <description>
     * @param  {[type]}
     * @param  {[type]}
     * @param  {[type]}
     * @return {[type]}
     */
    _onAPI(event, handler, context, callback) {

        let ev, i = 0,
            len = event.length;

        if (!callback) {
            callback = function() {
                let event = arguments[0],
                    _handler = arguments[1],
                    args = _.slice(arguments, 2); // TODO will arguments be read as an array?
                _handler.apply(this, args);
            };
        }

        for (; i < len; i++) {

            ev = evs[i];
            if (_.isObject(handler)) {
                this._parseObjectHandler(ev, handler, context, callback, this._onAPI);
            } else {

                let h;
                for (h in this._handlers(this, this._toArray(handler), context)) {
                    callback.bind(this, event, handlers[j]);
                    this._eventAPI(ev, callback, context);
                }
            }
        }

        return this;
    };

    /**
     * <description>
     * @param  {[type]}
     * @param  {[type]}
     * @param  {[type]}
     * @return {[type]}
     */
    once(event, handler, context) {
        if (!event) throw new exceptions.IllegalArgumentException("event is required");
        if (!handler) throw new exceptions.IllegalArgumentException("handler is required");

        context = context || this;

        if (_.isObject(event)) {
            var ev, params;
            for (ev in event) {
                params = event[ev];
                this.on(ev, params.handler, params.context);
            }
            return this;
        }

        return this._onceAPI(this._toArray(event), handler, context);
    };

    /**
     * <description>
     * @param  {[type]}
     * @param  {[type]}
     * @param  {[type]}
     * @return {[type]}
     */
    _onceAPI(event, handler, context) {

        return this._onAPI(event, handler, context, function() {
            let event = arguments[0],
                _handler = arguments[1],
                args = _.slice(arguments, 2); // TODO will arguments be read as an array?
            this.off(event, handler);
            _handler.apply(this, args);
        });
    };

    /**
     * <description>
     * @param  {[type]}
     * @param  {[type]}
     * @param  {[type]}
     * @return {[type]}
     */
    off(event, handler, context) {
        if (!event) throw new exceptions.IllegalArgumentException("event is required");
        // go through all handlers and remove
        // handle arrays, strings
        // 
        // If only event is specified, then unbind all callbacks for this event in the caller's context
        // If handler and event is specified, then unbind all matching handlers for that event
        // If only handler is specified, then unbind all matching handlers for all events
        // If all three are specified, then unbind all matching handlers with the matching context for that event
        // If handler and context are specified, then unbind all matching handlers with the matching context for all events
        // If context is specified, then unbind all handlers for all events containing the matching context
    };

    /**
     * <description>
     * @param  {[type]}
     * @param  {...[type]}
     * @return {[type]}
     */
    trigger(event, ...args) {
        if (!event) throw new exceptions.IllegalArgumentException("event is required");
        if (!this._events) throw new exception.IllegalStateException("no events are registered");
        // TODO handle if event is space sep, a function, or an array
        // TODO handle sub events!
        let i = 0,
            mappings = _.uniq(this._events[event], this._events["all"]),
            len = mappings.length;
        for (; i < len; i++) {
            // TODO use the widely-known call optimization technique
            mappings[i].callback.apply(mapping.context, args);
        }
        return this;
    };

    /**************************************************************************
     * Broadcasting / Multicasting
     **************************************************************************/

    /**
     * Respond to a broadcast
     * @param  {[type]} event   [description]
     * @param  {[type]} handler [description]
     * @param  {[type]} context [description]
     * @return {this}         	Returns the current context
     */
    respond(handler, context) {

        return this;
    };

    /**
     * Subscribe to a broadcast
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    subscribe(channel) {

    };

    /**
     * [broadcast description]
     * @param  {[type]}   channel 	[description]
     * @param  {...array} args  	[description]
     * @return {this}          		Returns the current context
     */
    broadcast(channel, ...args) {
        // what will be the difference between broadcast and puiblish/subscribe?
        // publish/scribue is a consumer/consumerable. consumers CANNOT return data to the publisher.
        // I'd also like the boradcast to be very lazy - no syntax restriction, etc. on what gets sent
        // 
        // broadcast on internets too?
        // Ok, so how do I want this to happen? 
        // a component reaches some state. it will want to broadcast this state on a pipe where anyone who's tapped into this pipe,
        // even if they dont have access to this object. I also want unhooking from this pipe to happen automatically when a component
        // is destroyed. but i dont want to have to go through a process to hook up to the pipe. I want to have a very simple statement

        return this;
    };

    /**************************************************************************
     * Publish / Subscribe
     **************************************************************************/

    // RabbitMQ has you set a listener to an actual network location (host), build a connection object, then create a channel from
    // that connection object. From there, clients declare a queue on the connection to receive...stuff. Clients then create a 
    // consumer object on the channel which has the method 'handleDelivery' implemented. Clients then tell the channel to setup
    // a 'consume' with the consumer object and queue (binding). Servers do the same, but don't need to implement a consumer object -
    // they just call publish on the channel
    // 
    // 1. A user must first elect a host. This can either be through a method or a properties/config object either passed to the 
    // channel method or by having a 'channels' object defined inside the class. If no host property is found, it defaults to
    // a local global bus.
    // 2. A user then creates channels off of the host, named as desired.
    // 3. When a user subscribes to a channel, they pass a handler, which gets attached to the channel. The handler will be called
    // 	  whenever the channel receives a consumable
    // 4. When a user published to a channel, they pass n-length arguments, which gets sent across the channel, over the host
    // 
    // Hosts have the ability to send and receive. On a POJ Bus, this is accomplished through callbacks (or events?). On an IOSocket
    // (network), this is accomplised through IOSocket's Client.
    // 
    // NOTE: Using a network-based Publish/Subscribe requries a WebSocket server to be running at the network destination.
    // Any forwarding to another client must be handled by that server.

    /**
     * [host description]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    host(name) {
        // If host is a network location, use IOSocket; otherwise, use a POJ. Set either to the host POJ bus internal object
        // return host
        let host;
        if (!(host = this._hosts[name])) {
            host = new Host(name);
            this._hosts[name] = host;
        }

        return host;
    };

    /**
     * [channel description]
     * @param  {[type]} channel [description]
     * @return {[type]}         [description]
     */
    channel(channel) {
        // i.e. "namespace" or "room"
        // 	1. check if channel is an object:
        // 		- If mutliple channel defs, iterate through each and initialize channels recursively
        // 		- else get channel name and host
        // 			- instantiate host and call channel on host with channel name
        // 	2. If channel is null, look for channel POJ on context and call channel() with it.

        if (!channel) {
            let channels;
            if (!(channels = this.channels) || !_.isObject(channels)) {
                throw new IllegalArgumentException("No channel definition was either supplied or found on caller");
            }

            return this.channel(channels);
        }

        if (_.isString(channel)) {
            return (new Host("global")).channel(channel);
        }

        if (!_.isObject(channel)) {
            throw new IllegalArgumentException("The 'channel' argument must be an object when provided");
        }

        switch (_.sizeof(channel)) {
            case 1:
                throw new IllegalArgumentException("Provided channel argument is incomplete. Expected 'host' and 'channel', or a mapping of multiple channels");
            case 2:
                return (new Host(channel.host)).channel(hannel.channel)
            default:
                let key, channels = [];
                for (key in channel) {
                    channels.push(this.channel({
                        host: channel[key],
                        channel: key
                    }));
                }
                // return an object that allows any chained operations to be acted upon all contained channels
                return new AggregatedChannels(channels);
        }
    };


    /**************************************************************************
     * Private Methods
     **************************************************************************/

    /**
     * <description>
     * @param  {[type]}
     * @param  {[type]}
     * @param  {[type]}
     * @return {[type]}
     */
    * _handlers(self, handlers, context) {

        let handler, i = 0,
            len = handlers.length;

        for (; i < len; i++) {
            handler = self[handlers[i]];
            handler.bind(context);

            yield handler;
        }
    };

    /**
     * <description>
     * @param  {[type]}
     * @param  {[type]}
     * @param  {[type]}
     * @return {[type]}
     */
    _eventAPI(event, handler, context) {
        this._events[event] || this._events[event] = [];
        this._events[event].push({
            callback: handler,
            context: context,
            referer: this.uid
        });
    };

    /**
     * <description>
     * @param  {[type]}
     * @param  {[type]}
     * @param  {[type]}
     * @param  {[type]}
     * @return {[type]}
     */
    _parseObjectHandler(event, handler, context, callback, api) {
        let subHandler, subevent, ev;

        for (subevent in handler) {
            ev = event + this.SUB_EV_SEP + subevent;
            subHandler = handler[subevent];
            api.call(this, ev, subHandler, context, callback);
        }
    };

    /**
     * <description>
     * @param  {[type]}
     * @return {[type]}
     */
    _toArray(name) {
        if (_.isArray(name)) return name;
        if (this.EV_COMMA_SEP.test(name)) return name.split(this.EV_COMMA_SEP);
        return name.split(this.EV_WS_SEP);
    };
}

export Event;

/**
 *
 */
class Host {

    // TODO
    // couple of big questions:
    // 1. How do we determine local vs network targeted hosts?
    // 2. When trying to communicate from one client to another, how do we tell the server to act as a channel/middle-man?
    // 3. What sort of messaging sytax will we have? More so, when we receive something, how do we determine what channel
    // 	  it is supposed to be for? Does socket.io handle this already?

    /**
     * [constructor description]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    constructor(name, secure = false) {
        if (!name) {
            throw IllegalArgumentException("Expected parameter 'name' for host");
        }

        this._name = name;
        this._error = null;

        this.INET_TEST = new Regexp(/^inet::.*$/, "gi");
        this.IPV4_TEST = new RegExp(source);
        this.IPV6_TEST = new RegExp(source);
        this.HTTP = "http";
        this.HTTPS = "https";
        this.URL_SCHEME = "://";
        this.HTTP_PREFIX = new RegExp(/^http[s]?:\/\//, "gi");
        this.LOCAL_HOST_RESVD = "localhost";

        this._channels = {};
        this._bus = this._testNameForRemote() ? _loadRemoteHost(secure) : _loadLocalHost();
    };

    /**
     * [onError description]
     * @param  {[type]} handler [description]
     * @param  {[type]} context [description]
     * @return {[type]}         [description]
     */
    onError(handler, context) {
    	this._error = handler.bind(context || this);
    	return this;
    };

    /**
     * [offError description]
     * @return {[type]} [description]
     */
    offError() {
    	this._error = null;
    	return this;
    };

    /**
     * [channel description]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    channel(name, error, context) {

        if (!_.isString(channel)) {
            throw new IllegalArgumentException("channel name must be a string when calling this method on a Host");
        }

        // internally the host receives stuff. when host does, it should notify the channels.
        // question is....how do we know which channel to notify based on the recevied data?
        let channel;
        if (!(channel = this._channels[name])) {
        	error = error || this._error;
            channel = new Channel(name, this, error, context);
        }

        return channel;
    };

    /**
     * [_testNameForRemote description]
     * @return {[boolean} Whether or not the hostname is a inet name or not
     */
    _testNameForRemote() {
        var name = this._name;
        if (this.INET_TEST.test(name)) {
            this._name = name.replace(/^inet::/gi, "");
            return true;
        }

        return this.LOCAL_HOST_RESVD === name || this.IPV4_TEST.test(name) || this.IPV6_TEST.test(name);
    };

    /**
     * [_loadRemoteHost description]
     * @param  {[type]} secure [description]
     * @param  {[type]} prefix [description]
     * @return {[type]}        [description]
     */
    _loadRemoteHost(secure, prefix) {
        // TODO should we do anything about namespacing?
        if (!this.HTTP_PREFIX.test(this._name) && prefix) {
            this._name = (secure ? this.HTTPS : this.HTTP) + this.URL_SCHEME + this._name;
        }
        return io(this._name);
    };

    /**
     * [_loadLocalHost description]
     * @return {[type]} [description]
     */
    _loadLocalHost() {
        return {
            on: function() {

            },

            emit: function() {

            }
        };
    };

    /**
     * [_triggerError description]
     * @param  {...[type]} args [description]
     * @return {[type]}         [description]
     */
    _triggerError(...args) {
        if (!this._error) return;
        err.handler.apply(ctx, args);
    };
}

export Host;

/**
 *
 */
class Channel {

    /**
     * [constructor description]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    constructor(name, host, error, context) {
        if (!name) {
            throw new IllegalArgumentException("Expected 'name' for channel");
        }

        if (!host) {
            throw new IllegalArgumentException("Expected 'host' for channel");
        }

        this._name = name;
        this._host = host;
        this._handlers = [];
        this._error = null;
        this.onError(error, context);
        this.join();
    };

    /**
     * [join description]
     * @return {[type]} [description]
     */
    join() {
    	// use arrow
        this._host.join(this._name, function(err) {
            this._triggerError(err);
        });
    };

    /**
     * [name description]
     * @return {[type]} [description]
     */
    name() {
        return this._name;
    };

    /**
     * [handlers description]
     * @return {[type]} [description]
     */
    handlers() {
        return this._handlers;
    };

    /**
     * [publish description]
     * @param  {...[type]} args [description]
     * @return {[type]}         [description]
     */
    publish(...args) {
        // must be done on a channel

        return this;
    };

    /**
     * [error description]
     * @param  {[type]} handler [description]
     * @param  {[type]} context [description]
     * @return {[type]}         [description]
     */
    onError(handler, context) {
        this._error handler.bind(context || this);
        return this;
    };

    /**
     * [off_error description]
     * @param  {[type]} handler [description]
     * @param  {[type]} context [description]
     * @return {[type]}         [description]
     */
    removeError(handler, context) {
        this._error = null;
        return this;
    };

    /**
     * [subscribe description]
     * @param  {[type]} handler [description]
     * @return {[type]}         [description]
     */
    subscribe(handler, context) {
        this._host.on("all", handler.bind(context || this));
        return this;
    };

    /**
     * [subscribeTo description]
     * @param  {[type]} event   [description]
     * @param  {[type]} handler [description]
     * @param  {[type]} context [description]
     * @return {[type]}         [description]
     */
    subscribeTo(event, handler, context) {
        this._host.on(event, handler.bind(context || this));
        return this;
    };

    /**
     * [unsubscribe description]
     * @param  {[type]} handlerOrContext [description]
     * @return {[type]}                  [description]
     */
    unsubscribe(event, handler) {

    	if (!event) {
    		event = "all";
    	}

    	if (!handler) {
    		this._host.removeListener(event, handler);
    	} else {
    		this._host.removeAllListeners(event);
    	}

        return this;
    };

    unsubscribeAll(event) {
        return this.unsubscribe(event);
    };

    /**
     * [close description]
     * @return {[type]} [description]
     */
    close() {
    	this._host.disconnect();
    	return this;
    };

    /**
     * [_triggerError description]
     * @param  {...[type]} args [description]
     * @return {[type]}         [description]
     */
    _triggerError(...args) {
        if (!this._error) return;
        err.handler.apply(ctx, args);
    };
}

/**
 *
 */
class AggregatedChannels {

    /**
     * [constructor description]
     * @param  {[type]} channels [description]
     * @return {[type]}          [description]
     */
    constructor(channels) {
        if (!channels) {
            throw new IllegalArgumentException("Expected a listing of channels");
        }
        this._channels = channels;
    }

    /**
     * [publish description]
     * @param  {...[type]} args [description]
     * @return {[type]}         [description]
     */
    publish(...args) {
        let channel, i = 0,
            channels = this._channels,
            len = channels.length;
        for (; i < len; i++) {
            channel = channels[i];
            channel.publish(args);
        }

        return this;
    };

    /**
     * [subscribe description]
     * @param  {[type]} handler [description]
     * @return {[type]}         [description]
     */
    subscribe(handler, context) {

        let channel, i = 0,
            channels = this._channels,
            len = channels.length;
        for (; i < len; i++) {
            channel = channels[i];
            channel.subscribe(handler);
        }

        return this;
    };

    /**
     * [unsubscribe description]
     * @param  {[type]} handlerOrContext [description]
     * @return {[type]}                  [description]
     */
    unsubscribe(handlerOrContext) {

        let channel, i = 0,
            channels = this._channels,
            len = channels.length;
        for (; i < len; i++) {
            channel = channels[i];
            channel.unsubscribe(handlerOrContext);
        }

        return this;
    };
}

export AggregatedChannels;