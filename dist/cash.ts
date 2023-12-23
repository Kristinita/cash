
const doc = document;
const win = window;
const docEle = doc.documentElement;
const createElement = doc.createElement.bind ( doc );
const div = createElement ( 'div' );
const table = createElement ( 'table' );
const tbody = createElement ( 'tbody' );
const tr = createElement ( 'tr' );
const {isArray, prototype: ArrayPrototype} = Array;
const {concat, filter, indexOf, map, push, slice, some, splice} = ArrayPrototype;

const idRe = /^#(?:[\w-]|\\.|[^\x00-\xa0])*$/;
const classRe = /^\.(?:[\w-]|\\.|[^\x00-\xa0])*$/;
const htmlRe = /<.+>/;
const tagRe = /^\w+$/;


// @require ./variables.ts

function find ( selector: string, context: Ele ): ArrayLike<Element> {

  const isFragment = isDocumentFragment ( context );

  return !selector || ( !isFragment && !isDocument ( context ) && !isElement ( context ) )
           ? []
           : !isFragment && classRe.test ( selector )
             ? context.getElementsByClassName ( selector.slice ( 1 ).replace ( /\\/g, '' ) )
             : !isFragment && tagRe.test ( selector )
               ? context.getElementsByTagName ( selector )
               : context.querySelectorAll ( selector );

}


// @require ./find.ts
// @require ./variables.ts

class Cash {

  constructor ( selector?: Selector, context?: Context | Cash ) {

    if ( !selector ) return;

    if ( isCash ( selector ) ) return selector;

    let eles: any = selector;

    if ( isString ( selector ) ) {

      const ctx = context || doc;

      eles = idRe.test ( selector ) && isDocument ( ctx )
                ? ctx.getElementById ( selector.slice ( 1 ).replace ( /\\/g, '' ) )
                : htmlRe.test ( selector )
                  ? parseHTML ( selector )
                  : isCash ( ctx )
                    ? ctx.find ( selector )
                      : isString ( ctx )
                        ? cash ( ctx ).find ( selector )
                        : find ( selector, ctx );

      if ( !eles ) return;

    } else if ( isFunction ( selector ) ) {

      return this.ready ( selector ); //FIXME: `fn.ready` is not included in `core`, but it's actually a core functionality

    }

    if ( eles.nodeType || eles === win ) eles = [eles];

    this.length = eles.length;

    for ( let i = 0, l = this.length; i < l; i++ ) {

      this[i] = eles[i];

    }

  }

  init ( selector?: Selector, context?: Context | Cash ) {

    return new Cash ( selector, context );

  }

}

const fn = Cash.prototype;
const cash = fn.init as ( typeof Cash.prototype.init & CashStatic );

cash.fn = cash.prototype = fn; // Ensuring that `cash () instanceof cash`

fn.length = 0;
fn.splice = splice; // Ensuring a cash collection gets printed as array-like in Chrome's devtools

if ( typeof Symbol === 'function' ) { // Ensuring a cash collection is iterable
  fn[Symbol['iterator']] = ArrayPrototype[Symbol['iterator']];
}


// @require ./cash.ts
// @require ./variables.ts

interface CashStatic {
  isWindow ( x: unknown ): x is Window;
  isFunction ( x: unknown ): x is Function;
  isArray ( x: unknown ): x is Array<any>;
  isNumeric ( x: unknown ): boolean;
  isPlainObject ( x: unknown ): x is PlainObject<any>;
}

function isCash ( value: unknown ): value is Cash {

  return value instanceof Cash;

}

function isWindow ( value: unknown ): value is Window {

  return !!value && value === value.window;

}

function isDocument ( value: unknown ): value is Document {

  return !!value && value.nodeType === 9;

}

function isDocumentFragment ( value: unknown ): value is DocumentFragment {

  return !!value && value.nodeType === 11;

}

function isElement ( value: unknown ): value is HTMLElement {

  return !!value && value.nodeType === 1;

}

function isText ( value: unknown ): value is Text {

  return !!value && value.nodeType === 3;

}

function isBoolean ( value: unknown ): value is boolean {

  return typeof value === 'boolean';

}

function isFunction ( value: unknown ): value is Function {

  return typeof value === 'function';

}

function isString ( value: unknown ): value is string {

  return typeof value === 'string';

}

function isUndefined ( value: unknown ): value is undefined {

  return value === undefined;

}

function isNull ( value: unknown ): value is null {

  return value === null;

}

function isNumeric ( value: unknown ): boolean {

  return !isNaN ( parseFloat ( value ) ) && isFinite ( value );

}

function isPlainObject ( value: unknown ): value is PlainObject<any> {

  if ( typeof value !== 'object' || value === null ) return false;

  const proto = Object.getPrototypeOf ( value );

  return proto === null || proto === Object.prototype;

}

cash.isWindow = isWindow;
cash.isFunction = isFunction;
cash.isArray = isArray;
cash.isNumeric = isNumeric;
cash.isPlainObject = isPlainObject;


// @require ./cash.ts
// @require ./type_checking.ts

type EachArrayCallback<T> = ( this: T, index: number, ele: T ) => any;
type EachObjectCallback<T> = ( this: T, key: string, value: T ) => any;

interface CashStatic {
  each<T> ( arr: ArrayLike<T>, callback: EachArrayCallback<T> ): void;
  each<T> ( obj: PlainObject<T>, callback: EachObjectCallback<T> ): void;
}

function each<T, U extends ArrayLike<T> = ArrayLike<T>> ( arr: U, callback: EachArrayCallback<T>, _reverse?: boolean ): U;
function each<T, U extends PlainObject<T> = PlainObject<T>> ( obj: U, callback: EachObjectCallback<T> ): U;
function each<T, U extends ArrayLike<T> | PlainObject<T> = ArrayLike<T>> ( arr: U, callback: EachArrayCallback<T> | EachObjectCallback<T>, _reverse?: boolean ): U {

  if ( _reverse ) {

    let i = arr.length;

    while ( i-- ) {

      if ( callback.call ( arr[i], i, arr[i] ) === false ) return arr;

    }

  } else if ( isPlainObject ( arr ) ) {

    const keys = Object.keys ( arr );

    for ( let i = 0, l = keys.length; i < l; i++ ) {

      const key = keys[i];

      if ( callback.call ( arr[key], key, arr[key] ) === false ) return arr;

    }

  } else {

    for ( let i = 0, l = arr.length; i < l; i++ ) {

      if ( callback.call ( arr[i], i, arr[i] ) === false ) return arr;

    }

  }

  return arr;

}

cash.each = each;


// @require core/cash.ts
// @require core/each.ts

interface Cash {
  each ( callback: EachArrayCallback<EleLoose> ): this;
}

fn.each = function ( this: Cash, callback: EachArrayCallback<EleLoose> ) {

  return each ( this, callback );

};


// @require ./type_checking.ts

const splitValuesRe = /\S+/g;

function getSplitValues ( str: string ) {

  return isString ( str ) ? str.match ( splitValuesRe ) || [] : [];

}


// @require core/cash.ts
// @require core/get_split_values.ts
// @require collection/each.ts

interface Cash {
  removeAttr ( attrs: string ): this;
}

fn.removeAttr = function ( this: Cash, attr: string ) {

  const attrs = getSplitValues ( attr );

  return this.each ( ( i, ele ) => {

    if ( !isElement ( ele ) ) return;

    each ( attrs, ( i, a ) => {

      ele.removeAttribute ( a );

    });

  });

};


// @require core/cash.ts
// @require core/type_checking.ts
// @require collection/each.ts
// @require ./remove_attr.ts

interface Cash {
  attr (): undefined;
  attr ( attrs: string ): string | null;
  attr ( attrs: string, value: string ): this;
  attr ( attrs: Record<string, string> ): this;
}

function attr ( this: Cash ): undefined;
function attr ( this: Cash, attr: string ): string | null;
function attr ( this: Cash, attr: string, value: string ): Cash;
function attr ( this: Cash, attr: Record<string, string> ): Cash;
function attr ( this: Cash, attr?: string | Record<string, string>, value?: string ) {

  if ( !attr ) return;

  if ( isString ( attr ) ) {

    if ( arguments.length < 2 ) {

      if ( !this[0] || !isElement ( this[0] ) ) return;

      const value = this[0].getAttribute ( attr );

      return isNull ( value ) ? undefined : value;

    }

    if ( isUndefined ( value ) ) return this;

    if ( isNull ( value ) ) return this.removeAttr ( attr );

    return this.each ( ( i, ele ) => {

      if ( !isElement ( ele ) ) return;

      ele.setAttribute ( attr, value )

    });

  }

  for ( const key in attr ) {

    this.attr ( key, attr[key] );

  }

  return this;

}

fn.attr = attr;


// @require core/cash.ts
// @require core/type_checking.ts
// @require core/variables.ts

interface Cash {
  get (): EleLoose[];
  get ( index: number ): EleLoose | undefined;
}

fn.get = function ( this: Cash, index?: number ) {

  if ( isUndefined ( index ) ) return slice.call ( this );

  index = Number ( index );

  return this[index < 0 ? index + this.length : index];

};


// @require core/cash.ts
// @require core/type_checking.ts
// @require collection/each.ts
// @require collection/get.ts

interface Cash {
  text (): string;
  text ( text: string ): this;
}

function text ( this: Cash ): string;
function text ( this: Cash, text: string ): Cash;
function text ( this: Cash, text?: string ) {

  if ( isUndefined ( text ) ) {

    return this.get ().map ( ele => isElement ( ele ) || isText ( ele ) ? ele.textContent : '' ).join ( '' );

  }

  return this.each ( ( i, ele ) => {

    if ( !isElement ( ele ) ) return;

    ele.textContent = text;

  });

}

fn.text = text;


// @require ./cash.ts

function matches ( ele: any, selector: string ): boolean {

  const matches = ele && ( ele['matches'] || ele['webkitMatchesSelector'] || ele['msMatchesSelector'] );

  return !!matches && !!selector && matches.call ( ele, selector );

}


// @require ./matches.ts
// @require ./type_checking.ts

function getCompareFunction ( comparator?: Comparator ): (( i: number, ele: EleLoose ) => boolean) {

  return isString ( comparator )
           ? ( i: number, ele: EleLoose ) => matches ( ele, comparator )
           : isFunction ( comparator )
             ? comparator
             : isCash ( comparator )
               ? ( i: number, ele: EleLoose ) => comparator.is ( ele )
               : !comparator
                 ? () => false
                 : ( i: number, ele: EleLoose ) => ele === comparator;

}


// @require core/cash.ts
// @require core/get_compare_function.ts
// @require core/type_checking.ts
// @require core/variables.ts
// @require collection/get.ts

interface Cash {
  filter ( comparator?: Comparator ): Cash;
}

fn.filter = function ( this: Cash, comparator?: Comparator ) {

  const compare = getCompareFunction ( comparator );

  return cash ( filter.call ( this, ( ele: EleLoose, i: number ) => compare.call ( ele, i, ele ) ) );

};


// @require collection/filter.ts

function filtered ( collection: Cash, comparator?: Comparator ): Cash {

  return !comparator ? collection : collection.filter ( comparator );

}


// @require core/cash.ts
// @require core/get_compare_function.ts
// @require core/variables.ts
// @require collection/each.ts

interface Cash {
  is ( comparator?: Comparator ): boolean;
}

fn.is = function ( this: Cash, comparator?: Comparator ) {

  const compare = getCompareFunction ( comparator );

  return some.call ( this, ( ele: EleLoose, i: number ) => compare.call ( ele, i, ele ) );

};


// @require ./get_compare_function.ts
// @require ./type_checking.ts
// @require ./variables.ts

type PluckCallback<T> = ( ele: T ) => ArrayLike<Ele>;

function pluck<T, U extends ArrayLike<T> = ArrayLike<T>> ( arr: U, prop: string | PluckCallback<U[0]>, deep?: boolean, until?: Comparator ): Array<Ele> {

  const plucked: Array<Ele> = [];
  const isCallback = isFunction ( prop );
  const compare = until && getCompareFunction ( until );

  for ( let i = 0, l = arr.length; i < l; i++ ) {

    if ( isCallback ) {

      const val = prop ( arr[i] );

      if ( val.length ) push.apply ( plucked, val );

    } else {

      let val = arr[i][prop];

      while ( val != null ) {

        if ( until && compare ( -1, val ) ) break;

        plucked.push ( val );

        val = deep ? val[prop] : null;

      }

    }

  }

  return plucked;

}


// @require ./cash.ts
// @require ./variables.ts

interface CashStatic {
  unique<T> ( arr: ArrayLike<T> ): ArrayLike<T>;
}

function unique<T> ( arr: ArrayLike<T> ): ArrayLike<T> {

  return arr.length > 1 ? filter.call ( arr, ( item: T, index: number, self: ArrayLike<T> ) => indexOf.call ( self, item ) === index ) : arr;

}

cash.unique = unique;


// @require core/cash.ts
// @require core/filtered.ts
// @require core/pluck.ts
// @require core/unique.ts

interface Cash {
  parent ( comparator?: Comparator ): Cash;
}

fn.parent = function ( this: Cash, comparator?: Comparator ) {

  return filtered ( cash ( unique ( pluck ( this, 'parentNode' ) ) ), comparator );

};


// @require core/cash.ts
// @require collection/filter.ts
// @require ./is.ts
// @require ./parent.ts

interface Cash {
  closest ( comparator?: Comparator ): Cash;
}

fn.closest = function ( this: Cash, comparator?: Comparator ) {

  const filtered = this.filter ( comparator );

  if ( filtered.length ) return filtered;

  const $parent = this.parent ();

  if ( !$parent.length ) return filtered;

  return $parent.closest ( comparator );

};


// @require core/cash.ts
// @require core/pluck.ts
// @require core/unique.ts
// @require core/find.ts
// @require core/variables.ts

interface Cash {
  find ( selector: string ): Cash;
}

fn.find = function ( this: Cash, selector: string ) {

  return cash ( unique ( pluck ( this, ele => find ( selector, ele ) ) ) );

};


// @require attributes/attr.ts

// @require manipulation/text.ts

// @require traversal/closest.ts

// @require traversal/find.ts


// @require methods.ts

export default cash;
export {Cash, CashStatic, Ele as Element, Selector, Comparator, Context};

