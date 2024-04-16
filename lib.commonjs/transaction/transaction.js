"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const index_js_1 = require("../address/index.js");
const index_js_2 = require("../crypto/index.js");
const index_js_3 = require("../utils/index.js");
const accesslist_js_1 = require("./accesslist.js");
const address_js_1 = require("./address.js");
const proto_encode_js_1 = require("../utils/proto-encode.js");
const proto_decode_js_1 = require("../utils/proto-decode.js");
const format_js_1 = require("../providers/format.js");
function _parseSignature(tx, fields) {
    let yParity;
    try {
        yParity = (0, format_js_1.handleNumber)(fields[0], "yParity");
        if (yParity !== 0 && yParity !== 1) {
            throw new Error("bad yParity");
        }
    }
    catch (error) {
        (0, index_js_3.assertArgument)(false, "invalid yParity", "yParity", fields[0]);
    }
    const r = (0, index_js_3.zeroPadValue)(fields[1], 32);
    const s = (0, index_js_3.zeroPadValue)(fields[2], 32);
    const signature = index_js_2.Signature.from({ r, s, yParity });
    tx.signature = signature;
}
/**
 *  A **Transaction** describes an operation to be executed on
 *  Ethereum by an Externally Owned Account (EOA). It includes
 *  who (the [[to]] address), what (the [[data]]) and how much (the
 *  [[value]] in ether) the operation should entail.
 *
 *  @example:
 *    tx = new Transaction()
 *    //_result:
 *
 *    tx.data = "0x1234";
 *    //_result:
 */
class Transaction {
    #type;
    #to;
    #data;
    #nonce;
    #gasLimit;
    #gasPrice;
    #maxPriorityFeePerGas;
    #maxFeePerGas;
    #value;
    #chainId;
    #sig;
    #accessList;
    #externalGasLimit;
    #externalGasTip;
    #externalGasPrice;
    #externalAccessList;
    #externalData;
    /**
     *  The transaction type.
     *
     *  If null, the type will be automatically inferred based on
     *  explicit properties.
     */
    get type() { return this.#type; }
    set type(value) {
        switch (value) {
            case null:
                this.#type = null;
                break;
            case 0:
            case "standard":
                this.#type = 0;
                break;
            // case 1: case "external":
            //     this.#type = 1;
            //     break;
            case 2:
            case "internalToExternal":
                this.#type = 2;
                break;
            default:
                (0, index_js_3.assertArgument)(false, "unsupported transaction type", "type", value);
        }
    }
    /**
     *  The name of the transaction type.
     */
    get typeName() {
        switch (this.type) {
            case 0: return "standard";
            case 1: return "external";
            case 2: return "internalToExternal";
        }
        return null;
    }
    /**
     *  The ``to`` address for the transaction or ``null`` if the
     *  transaction is an ``init`` transaction.
     */
    get to() { return this.#to; }
    set to(value) {
        this.#to = (value == null) ? null : (0, index_js_1.getAddress)(value);
    }
    /**
     *  The transaction nonce.
     */
    get nonce() { return this.#nonce; }
    set nonce(value) { this.#nonce = (0, index_js_3.getNumber)(value, "value"); }
    /**
     *  The gas limit.
     */
    get gasLimit() { return this.#gasLimit; }
    set gasLimit(value) { this.#gasLimit = (0, index_js_3.getBigInt)(value); }
    /**
     *  The gas price.
     *
     *  On legacy networks this defines the fee that will be paid. On
     *  EIP-1559 networks, this should be ``null``.
     */
    get gasPrice() {
        const value = this.#gasPrice;
        return value;
    }
    set gasPrice(value) {
        this.#gasPrice = (value == null) ? null : (0, index_js_3.getBigInt)(value, "gasPrice");
    }
    /**
     *  The maximum priority fee per unit of gas to pay. On legacy
     *  networks this should be ``null``.
     */
    get maxPriorityFeePerGas() {
        const value = this.#maxPriorityFeePerGas;
        if (value == null) {
            return null;
        }
        return value;
    }
    set maxPriorityFeePerGas(value) {
        this.#maxPriorityFeePerGas = (value == null) ? null : (0, index_js_3.getBigInt)(value, "maxPriorityFeePerGas");
    }
    /**
     *  The maximum total fee per unit of gas to pay. On legacy
     *  networks this should be ``null``.
     */
    get maxFeePerGas() {
        const value = this.#maxFeePerGas;
        if (value == null) {
            return null;
        }
        return value;
    }
    set maxFeePerGas(value) {
        this.#maxFeePerGas = (value == null) ? null : (0, index_js_3.getBigInt)(value, "maxFeePerGas");
    }
    /**
     *  The transaction data. For ``init`` transactions this is the
     *  deployment code.
     */
    get data() { return this.#data; }
    set data(value) { this.#data = (0, index_js_3.hexlify)(value); }
    /**
     *  The amount of ether to send in this transactions.
     */
    get value() { return this.#value; }
    set value(value) {
        this.#value = (0, index_js_3.getBigInt)(value, "value");
    }
    /**
     *  The chain ID this transaction is valid on.
     */
    get chainId() { return this.#chainId; }
    set chainId(value) { this.#chainId = (0, index_js_3.getBigInt)(value); }
    /**
     *  If signed, the signature for this transaction.
     */
    get signature() { return this.#sig || null; }
    set signature(value) {
        this.#sig = (value == null) ? null : index_js_2.Signature.from(value);
    }
    /**
     *  The access list.
     *
     *  An access list permits discounted (but pre-paid) access to
     *  bytecode and state variable access within contract execution.
     */
    get accessList() {
        const value = this.#accessList || null;
        if (value == null) {
            return null;
        }
        return value;
    }
    set accessList(value) {
        this.#accessList = (value == null) ? null : (0, accesslist_js_1.accessListify)(value);
    }
    /**
     *  The gas limit.
     */
    get externalGasLimit() { return this.#externalGasLimit; }
    set externalGasLimit(value) { this.#externalGasLimit = (0, index_js_3.getBigInt)(value); }
    /**
     *  The maximum priority fee per unit of gas to pay. On legacy
     *  networks this should be ``null``.
     */
    get externalGasTip() {
        const value = this.#externalGasTip;
        if (value == null) {
            return null;
        }
        return value;
    }
    set externalGasTip(value) {
        this.#externalGasTip = (value == null) ? null : (0, index_js_3.getBigInt)(value, "externalGasTip");
    }
    /**
     *  The maximum total fee per unit of gas to pay. On legacy
     *  networks this should be ``null``.
     */
    get externalGasPrice() {
        const value = this.#externalGasPrice;
        if (value == null) {
            return null;
        }
        return value;
    }
    set externalGasPrice(value) {
        this.#externalGasPrice = (value == null) ? null : (0, index_js_3.getBigInt)(value, "externalGasPrice");
    }
    /**
     *  The transaction externalData. For ``init`` transactions this is the
     *  deployment code.
     */
    get externalData() { return this.#externalData; }
    set externalData(value) { this.#externalData = (0, index_js_3.hexlify)(value); }
    /**
     *  The external access list.
     *
     *  An access list permits discounted (but pre-paid) access to
     *  bytecode and state variable access within contract execution.
     */
    get externalAccessList() {
        const value = this.#externalAccessList || null;
        if (value == null) {
            return null;
        }
        return value;
    }
    set externalAccessList(value) {
        this.#externalAccessList = (value == null) ? null : (0, accesslist_js_1.accessListify)(value);
    }
    /**
     *  Creates a new Transaction with default values.
     */
    constructor() {
        this.#type = null;
        this.#to = null;
        this.#nonce = 0;
        this.#gasLimit = BigInt(0);
        this.#gasPrice = null;
        this.#maxPriorityFeePerGas = null;
        this.#maxFeePerGas = null;
        this.#data = "0x";
        this.#value = BigInt(0);
        this.#chainId = BigInt(0);
        this.#sig = null;
        this.#accessList = null;
        this.#externalGasLimit = BigInt(0);
        this.#externalGasTip = null;
        this.#externalGasPrice = null;
        this.#externalData = "0x";
        this.#externalAccessList = null;
    }
    /**
     *  The transaction hash, if signed. Otherwise, ``null``.
     */
    get hash() {
        if (this.signature == null) {
            return null;
        }
        return (0, index_js_2.keccak256)(this.serialized);
    }
    /**
     *  The pre-image hash of this transaction.
     *
     *  This is the digest that a [[Signer]] must sign to authorize
     *  this transaction.
     */
    get unsignedHash() {
        return (0, index_js_2.keccak256)(this.unsignedSerialized);
    }
    /**
     *  The sending address, if signed. Otherwise, ``null``.
     */
    get from() {
        if (this.signature == null) {
            return null;
        }
        return (0, address_js_1.recoverAddress)(this.unsignedHash, this.signature);
    }
    /**
     *  The public key of the sender, if signed. Otherwise, ``null``.
     */
    get fromPublicKey() {
        if (this.signature == null) {
            return null;
        }
        return index_js_2.SigningKey.recoverPublicKey(this.unsignedHash, this.signature);
    }
    /**
     *  Returns true if signed.
     *
     *  This provides a Type Guard that properties requiring a signed
     *  transaction are non-null.
     */
    isSigned() {
        //isSigned(): this is SignedTransaction {
        return this.signature != null;
    }
    /**
     *  The serialized transaction.
     *
     *  This throws if the transaction is unsigned. For the pre-image,
     *  use [[unsignedSerialized]].
     */
    get serialized() {
        (0, index_js_3.assert)(this.signature != null, "cannot serialize unsigned transaction; maybe you meant .unsignedSerialized", "UNSUPPORTED_OPERATION", { operation: ".serialized" });
        return this.#serialize();
    }
    /**
     *  The transaction pre-image.
     *
     *  The hash of this is the digest which needs to be signed to
     *  authorize this transaction.
     */
    get unsignedSerialized() {
        return this.#serialize();
    }
    /**
     *  Return the most "likely" type; currently the highest
     *  supported transaction type.
     */
    inferType() {
        return (this.inferTypes().pop());
    }
    /**
     *  Validates the explicit properties and returns a list of compatible
     *  transaction types.
     */
    inferTypes() {
        // Checks that there are no conflicting properties set
        // const hasGasPrice = this.gasPrice != null;
        // const hasFee = (this.maxFeePerGas != null || this.maxPriorityFeePerGas != null);
        const hasExternal = (this.externalGasLimit != null || this.externalGasTip != null || this.externalGasPrice != null || this.externalData != null || this.externalAccessList != null);
        // const hasAccessList = (this.accessList != null);
        //if (hasGasPrice && hasFee) {
        //    throw new Error("transaction cannot have gasPrice and maxFeePerGas");
        //}
        if (this.maxFeePerGas != null && this.maxPriorityFeePerGas != null) {
            (0, index_js_3.assert)(this.maxFeePerGas >= this.maxPriorityFeePerGas, "priorityFee cannot be more than maxFee", "BAD_DATA", { value: this });
        }
        //if (this.type === 2 && hasGasPrice) {
        //    throw new Error("eip-1559 transaction cannot have gasPrice");
        //}
        (0, index_js_3.assert)(hasExternal || (this.type !== 0 && this.type !== 1), "transaction type cannot have externalGasLimit, externalGasTip, externalGasPrice, externalData, or externalAccessList", "BAD_DATA", { value: this });
        const types = [];
        // Explicit type
        if (this.type != null) {
            types.push(this.type);
        }
        else {
            if (hasExternal) {
                types.push(2);
            }
            else {
                types.push(0);
            }
        }
        types.sort();
        return types;
    }
    /**
     *  Create a copy of this transaciton.
     */
    clone() {
        return Transaction.from(this);
    }
    /**
     *  Return a JSON-friendly object.
     */
    toJSON() {
        const s = (v) => {
            if (v == null) {
                return null;
            }
            return v.toString();
        };
        return {
            type: this.type,
            to: this.to,
            // from: this.from,
            data: this.data,
            nonce: this.nonce,
            gasLimit: s(this.gasLimit),
            gasPrice: s(this.gasPrice),
            maxPriorityFeePerGas: s(this.maxPriorityFeePerGas),
            maxFeePerGas: s(this.maxFeePerGas),
            value: s(this.value),
            chainId: s(this.chainId),
            signature: this.signature ? this.signature.toJSON() : null,
            hash: this.hash,
            accessList: this.accessList,
            externalGasLimit: s(this.externalGasLimit),
            externalGasTip: s(this.externalGasTip),
            externalGasPrice: s(this.externalGasPrice),
            externalData: this.externalData,
            externalAccessList: this.externalAccessList,
        };
    }
    /**
     *  Return a protobuf-friendly JSON object.
     */
    toProtobuf() {
        const protoTx = {
            type: (this.type || 0),
            chain_id: (0, format_js_1.formatNumber)(this.chainId || 0, "chainId"),
            nonce: (this.nonce || 0),
            gas_tip_cap: (0, format_js_1.formatNumber)(this.maxPriorityFeePerGas || 0, "maxPriorityFeePerGas"),
            gas_fee_cap: (0, format_js_1.formatNumber)(this.maxFeePerGas || 0, "maxFeePerGas"),
            gas: Number(this.gasLimit || 0),
            to: this.to != null ? (0, index_js_3.getBytes)(this.to) : new Uint8Array(0),
            value: (0, format_js_1.formatNumber)(this.value || 0, "value"),
            data: (0, index_js_3.getBytes)(this.data || "0x"),
            access_list: { access_tuples: [] },
        };
        if (this.type == 2) {
            protoTx.etx_gas_limit = Number(this.externalGasLimit || 0);
            protoTx.etx_gas_price = (0, format_js_1.formatNumber)(this.externalGasPrice || 0, "externalGasPrice");
            protoTx.etx_gas_tip = (0, format_js_1.formatNumber)(this.externalGasTip || 0, "externalGasTip");
            protoTx.etx_data = (0, index_js_3.getBytes)(this.externalData || "0x");
            protoTx.etx_access_list = { access_tuples: [] };
        }
        if (this.signature) {
            protoTx.v = (0, format_js_1.formatNumber)(this.signature.yParity, "yParity");
            protoTx.r = (0, index_js_3.toBeArray)(this.signature.r);
            protoTx.s = (0, index_js_3.toBeArray)(this.signature.s);
            protoTx.signature = (0, index_js_3.getBytes)(this.signature.serialized);
        }
        return protoTx;
    }
    /**
     *  Create a **Transaction** from a serialized transaction or a
     *  Transaction-like object.
     */
    static from(tx) {
        if (tx == null) {
            return new Transaction();
        }
        if (typeof (tx) === "string") {
            const decodedProtoTx = (0, proto_decode_js_1.decodeProtoTransaction)((0, index_js_3.getBytes)(tx));
            return Transaction.fromProto(decodedProtoTx);
        }
        const result = new Transaction();
        if (tx.type != null) {
            result.type = tx.type;
        }
        if (tx.to != null) {
            result.to = tx.to;
        }
        if (tx.nonce != null) {
            result.nonce = tx.nonce;
        }
        if (tx.gasLimit != null) {
            result.gasLimit = tx.gasLimit;
        }
        if (tx.maxPriorityFeePerGas != null) {
            result.maxPriorityFeePerGas = tx.maxPriorityFeePerGas;
        }
        if (tx.maxFeePerGas != null) {
            result.maxFeePerGas = tx.maxFeePerGas;
        }
        if (tx.data != null) {
            result.data = tx.data;
        }
        if (tx.value != null) {
            result.value = tx.value;
        }
        if (tx.chainId != null) {
            result.chainId = tx.chainId;
        }
        if (tx.signature != null) {
            result.signature = index_js_2.Signature.from(tx.signature);
        }
        if (tx.accessList != null) {
            result.accessList = tx.accessList;
        }
        if (tx.externalGasLimit != null) {
            result.externalGasLimit = tx.externalGasLimit;
        }
        if (tx.externalGasPrice != null) {
            result.externalGasPrice = tx.externalGasPrice;
        }
        if (tx.externalGasTip != null) {
            result.externalGasTip = tx.externalGasTip;
        }
        if (tx.externalData != null) {
            result.externalData = tx.externalData;
        }
        if (tx.externalAccessList != null) {
            result.externalAccessList = tx.externalAccessList;
        }
        if (tx.hash != null) {
            (0, index_js_3.assertArgument)(result.isSigned(), "unsigned transaction cannot define hash", "tx", tx);
            (0, index_js_3.assertArgument)(result.hash === tx.hash, "hash mismatch", "tx", tx);
        }
        if (tx.from != null) {
            (0, index_js_3.assertArgument)(result.isSigned(), "unsigned transaction cannot define from", "tx", tx);
            (0, index_js_3.assertArgument)(result.from.toLowerCase() === (tx.from || "").toLowerCase(), "from mismatch", "tx", tx);
        }
        return result;
    }
    /**
    * Create a **Transaction** from a ProtoTransaction object.
    */
    static fromProto(protoTx) {
        const tx = new Transaction();
        tx.type = protoTx.type;
        tx.chainId = (0, index_js_3.toBigInt)(protoTx.chain_id);
        tx.nonce = protoTx.nonce;
        tx.maxPriorityFeePerGas = (0, index_js_3.toBigInt)(protoTx.gas_tip_cap);
        tx.maxFeePerGas = (0, index_js_3.toBigInt)(protoTx.gas_fee_cap);
        tx.gasLimit = (0, index_js_3.toBigInt)(protoTx.gas);
        tx.to = (0, index_js_3.hexlify)(protoTx.to);
        tx.value = (0, index_js_3.toBigInt)(protoTx.value);
        tx.data = (0, index_js_3.hexlify)(protoTx.data);
        tx.accessList = protoTx.access_list.access_tuples.map(tuple => ({
            address: (0, index_js_3.hexlify)(tuple.address),
            storageKeys: tuple.storage_key.map(key => (0, index_js_3.hexlify)(key))
        }));
        if (protoTx.type == 2) {
            tx.externalGasLimit = (0, index_js_3.toBigInt)(protoTx.etx_gas_limit);
            tx.externalGasPrice = (0, index_js_3.toBigInt)(protoTx.etx_gas_price);
            tx.externalGasTip = (0, index_js_3.toBigInt)(protoTx.etx_gas_tip);
            tx.externalData = (0, index_js_3.hexlify)(protoTx.etx_data);
            tx.externalAccessList = protoTx.etx_access_list.access_tuples.map(tuple => ({
                address: (0, index_js_3.hexlify)(tuple.address),
                storageKeys: tuple.storage_key.map(key => (0, index_js_3.hexlify)(key))
            }));
        }
        if (protoTx.signature) {
            const signatureFields = [
                (0, index_js_3.hexlify)(protoTx.v),
                (0, index_js_3.hexlify)(protoTx.r),
                (0, index_js_3.hexlify)(protoTx.s),
            ];
            _parseSignature(tx, signatureFields);
        }
        return tx;
    }
    /**
     *  Serializes the WorkObject to a string.
     *
     *  @returns The serialized string representation of the WorkObject.
     */
    #serialize() {
        return (0, proto_encode_js_1.encodeProtoTransaction)(this.toProtobuf());
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.js.map