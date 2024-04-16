import { Signature } from "../crypto/index.js";
import type { BigNumberish, BytesLike } from "../utils/index.js";
import type { SignatureLike } from "../crypto/index.js";
import type { AccessList, AccessListish } from "./index.js";
export interface TransactionLike<A = string> {
    /**
     *  The type.
     */
    type?: null | number;
    /**
     *  The recipient address or ``null`` for an ``init`` transaction.
     */
    to?: null | A;
    /**
     *  The sender.
     */
    from?: null | A;
    /**
     *  The nonce.
     */
    nonce?: null | number;
    /**
     *  The maximum amount of gas that can be used.
     */
    gasLimit?: null | BigNumberish;
    /**
     *  The gas price for legacy and berlin transactions.
     */
    gasPrice?: null | BigNumberish;
    /**
     *  The maximum priority fee per gas for london transactions.
     */
    maxPriorityFeePerGas?: null | BigNumberish;
    /**
     *  The maximum total fee per gas for london transactions.
     */
    maxFeePerGas?: null | BigNumberish;
    /**
     *  The data.
     */
    data?: null | string;
    /**
     *  The value (in wei) to send.
     */
    value?: null | BigNumberish;
    /**
     *  The chain ID the transaction is valid on.
     */
    chainId?: null | BigNumberish;
    /**
     *  The transaction hash.
     */
    hash?: null | string;
    /**
     *  The signature provided by the sender.
     */
    signature?: null | SignatureLike;
    /**
     *  The access list for berlin and london transactions.
     */
    accessList?: null | AccessListish;
    /**
     * The external gas price.
     */
    externalGasPrice?: null | BigNumberish;
    /**
     * The external gas tip.
     */
    externalGasTip?: null | BigNumberish;
    /**
     * The external gas limit.
     */
    externalGasLimit?: null | BigNumberish;
    /**
     *  The external data.
     */
    externalData?: null | string;
    /**
     *  The access list for berlin and london transactions.
     */
    externalAccessList?: null | AccessListish;
}
export interface ProtoTransaction {
    type: number;
    to: Uint8Array;
    nonce: number;
    value: Uint8Array;
    gas: number;
    data: Uint8Array;
    chain_id: Uint8Array;
    gas_fee_cap: Uint8Array;
    gas_tip_cap: Uint8Array;
    access_list: ProtoAccessList;
    etx_gas_limit?: number;
    etx_gas_price?: Uint8Array;
    etx_gas_tip?: Uint8Array;
    etx_data?: Uint8Array;
    etx_access_list?: ProtoAccessList;
    v?: Uint8Array;
    r?: Uint8Array;
    s?: Uint8Array;
    originating_tx_hash?: string;
    etx_index?: number;
    etx_sender?: Uint8Array;
    signature?: Uint8Array;
}
export interface ProtoAccessList {
    access_tuples: Array<ProtoAccessTuple>;
}
export interface ProtoAccessTuple {
    address: Uint8Array;
    storage_key: Array<Uint8Array>;
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
export declare class Transaction implements TransactionLike<string> {
    #private;
    /**
     *  The transaction type.
     *
     *  If null, the type will be automatically inferred based on
     *  explicit properties.
     */
    get type(): null | number;
    set type(value: null | number | string);
    /**
     *  The name of the transaction type.
     */
    get typeName(): null | string;
    /**
     *  The ``to`` address for the transaction or ``null`` if the
     *  transaction is an ``init`` transaction.
     */
    get to(): null | string;
    set to(value: null | string);
    /**
     *  The transaction nonce.
     */
    get nonce(): number;
    set nonce(value: BigNumberish);
    /**
     *  The gas limit.
     */
    get gasLimit(): bigint;
    set gasLimit(value: BigNumberish);
    /**
     *  The gas price.
     *
     *  On legacy networks this defines the fee that will be paid. On
     *  EIP-1559 networks, this should be ``null``.
     */
    get gasPrice(): null | bigint;
    set gasPrice(value: null | BigNumberish);
    /**
     *  The maximum priority fee per unit of gas to pay. On legacy
     *  networks this should be ``null``.
     */
    get maxPriorityFeePerGas(): null | bigint;
    set maxPriorityFeePerGas(value: null | BigNumberish);
    /**
     *  The maximum total fee per unit of gas to pay. On legacy
     *  networks this should be ``null``.
     */
    get maxFeePerGas(): null | bigint;
    set maxFeePerGas(value: null | BigNumberish);
    /**
     *  The transaction data. For ``init`` transactions this is the
     *  deployment code.
     */
    get data(): string;
    set data(value: BytesLike);
    /**
     *  The amount of ether to send in this transactions.
     */
    get value(): bigint;
    set value(value: BigNumberish);
    /**
     *  The chain ID this transaction is valid on.
     */
    get chainId(): bigint;
    set chainId(value: BigNumberish);
    /**
     *  If signed, the signature for this transaction.
     */
    get signature(): null | Signature;
    set signature(value: null | SignatureLike);
    /**
     *  The access list.
     *
     *  An access list permits discounted (but pre-paid) access to
     *  bytecode and state variable access within contract execution.
     */
    get accessList(): null | AccessList;
    set accessList(value: null | AccessListish);
    /**
     *  The gas limit.
     */
    get externalGasLimit(): bigint;
    set externalGasLimit(value: BigNumberish);
    /**
     *  The maximum priority fee per unit of gas to pay. On legacy
     *  networks this should be ``null``.
     */
    get externalGasTip(): null | bigint;
    set externalGasTip(value: null | BigNumberish);
    /**
     *  The maximum total fee per unit of gas to pay. On legacy
     *  networks this should be ``null``.
     */
    get externalGasPrice(): null | bigint;
    set externalGasPrice(value: null | BigNumberish);
    /**
     *  The transaction externalData. For ``init`` transactions this is the
     *  deployment code.
     */
    get externalData(): string;
    set externalData(value: BytesLike);
    /**
     *  The external access list.
     *
     *  An access list permits discounted (but pre-paid) access to
     *  bytecode and state variable access within contract execution.
     */
    get externalAccessList(): null | AccessList;
    set externalAccessList(value: null | AccessListish);
    /**
     *  Creates a new Transaction with default values.
     */
    constructor();
    /**
     *  The transaction hash, if signed. Otherwise, ``null``.
     */
    get hash(): null | string;
    /**
     *  The pre-image hash of this transaction.
     *
     *  This is the digest that a [[Signer]] must sign to authorize
     *  this transaction.
     */
    get unsignedHash(): string;
    /**
     *  The sending address, if signed. Otherwise, ``null``.
     */
    get from(): null | string;
    /**
     *  The public key of the sender, if signed. Otherwise, ``null``.
     */
    get fromPublicKey(): null | string;
    /**
     *  Returns true if signed.
     *
     *  This provides a Type Guard that properties requiring a signed
     *  transaction are non-null.
     */
    isSigned(): this is (Transaction & {
        type: number;
        typeName: string;
        from: string;
        signature: Signature;
    });
    /**
     *  The serialized transaction.
     *
     *  This throws if the transaction is unsigned. For the pre-image,
     *  use [[unsignedSerialized]].
     */
    get serialized(): string;
    /**
     *  The transaction pre-image.
     *
     *  The hash of this is the digest which needs to be signed to
     *  authorize this transaction.
     */
    get unsignedSerialized(): string;
    /**
     *  Return the most "likely" type; currently the highest
     *  supported transaction type.
     */
    inferType(): number;
    /**
     *  Validates the explicit properties and returns a list of compatible
     *  transaction types.
     */
    inferTypes(): Array<number>;
    /**
     *  Create a copy of this transaciton.
     */
    clone(): Transaction;
    /**
     *  Return a JSON-friendly object.
     */
    toJSON(): TransactionLike;
    /**
     *  Return a protobuf-friendly JSON object.
     */
    toProtobuf(): ProtoTransaction;
    /**
     *  Create a **Transaction** from a serialized transaction or a
     *  Transaction-like object.
     */
    static from(tx?: string | TransactionLike<string>): Transaction;
    /**
    * Create a **Transaction** from a ProtoTransaction object.
    */
    static fromProto(protoTx: ProtoTransaction): Transaction;
}
//# sourceMappingURL=transaction.d.ts.map