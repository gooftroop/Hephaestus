import _ from "lodash";
import md from "forge";
import {
    NullPointerException, ClassCastException, NotYetImplementedException
}
from "exceptions";

/**
 *
 */

/**
 * NOTE: According to ECMAScript 6 Standards 11.6.2.2, 'interface' is a
 * future-reserved word, so this multiple extends may be able to be
 * replaced with interface-based inheritance later on.
 */
class Component extends _.assign(Object, Comparable, Serializable, _) {

    // TODO use Component, or override javascript's Object?
    // TODO modify constructor to accept object as a clone constructor

    /**
     * <description>
     */
    constructor(clone = null) {
        this.generateID();
    };

    generateID() {
    	this.uid || (this.uid = (function b(a) {
            return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b)
        })());
    };

    /**
     * Get the ID of this component. If {generateID} is overridden,
     * this method returns the custom ID; otherwise it returns a 
     * standard UUID4.
     * @return {String} The ID of this component.
     */
    id() {
    	return this.uid;
    };

    /**
     * <description>
     * @param  {Boolean}
     * @return {[type]}
     */
    clone(deep = false) {
        return _.clone(this, deep);
    };

    /**
     * <description>
     * @return {[type]}
     */
    toString() {
        return this.constructor.name + "@" + this.hashCode();
    };

    /**
     * <description>
     * @return {[type]}
     */
    hashCode() {
        let prop, hash = md.md5.create();
        for (prop in this) {
            hash.update(prop);
        }
        return hash.digest().toHex();
    };

    /**
     * <description>
     * @return {[type]}
     */
    notify() {
        // can we use async (rather than thread-based)?
    };

    /**
     * <description>
     * @return {[type]}
     */
    notifyAll() {
        // can we use async (rather than thread-based)?
    };

    /**
     * <description>
     * @param  {Number}
     * @return {[type]}
     */
    wait(timeout = 0) {
        // can we use async (rather than thread-based)?
        // set a timeout if we have timeout
    };

    /*
     * Inherited from Comparable
     */
    /**
     * <description>
     * @param  {[type]}
     * @return {[type]}
     */
    equals(comparable) {
        if (!comparable) throw new NullPointerException("comparable");
        if (_.has(comparable, "hashCode") && _.has(this, "hashCode")) {
            return comparable.hashCode() === this.hashCode();
        }

        return _.isEquals(this, comparable);
    };

    /**
     * <description>
     * @param  {[type]}
     * @return {[type]}
     */
    compareTo(comparable) {
        if (!comparable) throw new NullPointerException("comparable");
        if (!_.has(comparable, "hashCode")) throw new IllegalArgumentException("Comparable is not an Component object");
        return comparable.hashCode() - comparable.hashCode();
    };

    /**
     * [_isSameType description]
     * @param  {[type]}  arg1 [description]
     * @param  {[type]}  arg2 [description]
     * @return {Boolean}      [description]
     */
    _isSameType(arg1, arg2) {
        return this._toType(arg1) === this._toType(arg2);
    };

    /**
     * [_toType description]
     * @param  {[type]} arg [description]
     * @return {[type]}     [description]
     */
    _toType(arg) {
        return ({}).toString.call(arg).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
    };

    /**
     * <description>
     * @return {[type]}
     */
    serialize(deep = false) {
        if (!deep) return JSON.stringify(this);
        return JSON.stringify(this, function(key, value) {
            if (typeof value === 'function') {
                return value.toString();
            }
            return value;
        });
    };

    /**
     * <description>
     * @param  {[type]}
     * @return {[type]}
     */
    deserialize(serialized) {
        return JSON.parse(serialized, function(key, value) {
                if (value && typeof value === "string" && value.substr(0, 8) == "function") {
                    var startBody = value.indexOf('{') + 1;
                    var endBody = value.lastIndexOf('}');
                    var startArgs = value.indexOf(' (') + 1;
                    var endArgs = value.indexOf(')');
                    return new Function(value.substring(startArgs, endArgs), value.substring(startBody, endBody));
                }
                return value;
            }
        }
    };
}

export Component;

/**
 * <<Interface>>
 * Comparable
 */
class Comparable {

    /**
     * <description>
     * @param  {[type]}
     * @return {[type]}
     */
    equals(comparable) {
        throw new NotYetImplementedException("Inheritors are required to implement this function");
    };

    /**
     * <description>
     * @param  {[type]}
     * @return {[type]}
     */
    compareTo(comparable) {
        throw new NotYetImplementedException("Inheritors are required to implement this function");
    };

    /**
     * [_isSameType description]
     * @param  {[type]}  arg1 [description]
     * @param  {[type]}  arg2 [description]
     * @return {Boolean}      [description]
     */
    _isSameType(arg1, arg2) {
        throw new NotYetImplementedException("Inheritors are required to implement this function");
    };

    /**
     * [_toType description]
     * @param  {[type]} arg [description]
     * @return {[type]}     [description]
     */
    _toType(arg) {
        throw new NotYetImplementedException("Inheritors are required to implement this function");
    };
}

export Comparable;

/**
 *
 */
class Serializable {

    /**
     * <description>
     * @return {[type]}
     */
    serialize(deep = false) {
        throw new NotYetImplementedException("Inheritors are required to implement this function");
    };

    /**
     * <description>
     * @param  {[type]}
     * @return {[type]}
     */
    deserialize(serialized) {
        throw new NotYetImplementedException("Inheritors are required to implement this function");
    };
}

export Serializable;