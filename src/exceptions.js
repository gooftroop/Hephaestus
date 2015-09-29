/**
 *
 */

/**
 * HephaestusError
 * 
 * Semantically use an Error object unique to this framework as a parent to all
 * future Exceptions.
 */
class HephaestusError extends Error {

	/**
	 * [constructor description]
	 * @param  {[type]} message    [description]
	 * @param  {[type]} filename   [description]
	 * @param  {[type]} linenumber [description]
	 * @return {[type]}            [description]
	 */
	constructor(message, filename = null, linenumber = null) {
        super(message, filename, linenumber);
    };
}

export HephaestusError;

/**
 * 
 */
class IllegalArgumentException extends HephaestusError {

	/**
	 * [constructor description]
	 * @param  {[type]} message    [description]
	 * @param  {[type]} filename   [description]
	 * @param  {[type]} linenumber [description]
	 * @return {[type]}            [description]
	 */
    constructor(message, filename = null, linenumber = null) {
        super(message, filename, linenumber);
    };
}

export IllegalArgumentException;

/**
 * 
 */
class IllegalStateException extends HephaestusError {

	/**
	 * [constructor description]
	 * @param  {[type]} message    [description]
	 * @param  {[type]} filename   [description]
	 * @param  {[type]} linenumber [description]
	 * @return {[type]}            [description]
	 */
    constructor(message, filename = null, linenumber = null) {
        super(message, filename, linenumber);
    };
}

export IllegalStateException;

/**
 * 
 */
class ValidationException extends HephaestusError {

	/**
	 * [constructor description]
	 * @param  {[type]} message    [description]
	 * @param  {[type]} filename   [description]
	 * @param  {[type]} linenumber [description]
	 * @return {[type]}            [description]
	 */
    constructor(message, filename = null, linenumber = null) {
        super(message, filename, linenumber);
    };
}

export ValidationException;

/**
 * 
 */
class NullPointerException extends HephaestusError {

	/**
	 * [constructor description]
	 * @param  {[type]} message    [description]
	 * @param  {[type]} filename   [description]
	 * @param  {[type]} linenumber [description]
	 * @return {[type]}            [description]
	 */
    constructor(message, filename = null, linenumber = null) {
        super(message, filename, linenumber);
    };
}

export NullPointerException;

/**
 * 
 */
class ClassCastException extends HephaestusError {

	/**
	 * [constructor description]
	 * @param  {[type]} message    [description]
	 * @param  {[type]} filename   [description]
	 * @param  {[type]} linenumber [description]
	 * @return {[type]}            [description]
	 */
    constructor(message, filename = null, linenumber = null) {
        super(message, filename, linenumber);
    };
};

export ClassCastException;

/**
 * 
 */
class NotYetImplementedException extends HephaestusError {

	/**
	 * [constructor description]
	 * @param  {[type]} message    [description]
	 * @param  {[type]} filename   [description]
	 * @param  {[type]} linenumber [description]
	 * @return {[type]}            [description]
	 */
	constructor(message, filename = null, linenumber = null) {
        super(message, filename, linenumber);
    };
}

export NotYetImplementedException;