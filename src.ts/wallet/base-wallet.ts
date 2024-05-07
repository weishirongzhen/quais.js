import { getAddress, resolveAddress } from "../address/index.js";
import { hashMessage, TypedDataEncoder } from "../hash/index.js";
import { AbstractSigner } from "../providers/index.js";
import { computeAddress } from "../transaction/index.js";
import {
    resolveProperties, assertArgument
} from "../utils/index.js";

import type { SigningKey } from "../crypto/index.js";
import type { TypedDataDomain, TypedDataField } from "../hash/index.js";
import type { Provider } from "../providers/index.js";
import { QuaiTransactionRequest } from "../providers/provider.js";
import { QuaiTransaction, QuaiTransactionLike } from "../transaction/quai-transaction.js";

/**
 *  The **BaseWallet** is a stream-lined implementation of a
 *  [[Signer]] that operates with a private key.
 *
 *  It is preferred to use the [[Wallet]] class, as it offers
 *  additional functionality and simplifies loading a variety
 *  of JSON formats, Mnemonic Phrases, etc.
 *
 *  This class may be of use for those attempting to implement
 *  a minimal Signer.
 */
export class BaseWallet extends AbstractSigner {
    /**
     *  The wallet address.
     */
    readonly #address!: string;

    readonly #signingKey: SigningKey;

    /**
     *  Creates a new BaseWallet for %%privateKey%%, optionally
     *  connected to %%provider%%.
     *
     *  If %%provider%% is not specified, only offline methods can
     *  be used.
     */
    constructor(privateKey: SigningKey, provider?: null | Provider) {
        super(provider);

        assertArgument(privateKey && typeof (privateKey.sign) === "function", "invalid private key", "privateKey", "[ REDACTED ]");

        this.#signingKey = privateKey;

        this.#address = computeAddress(this.signingKey.publicKey);
    }

    // Store private values behind getters to reduce visibility

    /**
     * The address of this wallet.
     */
    get address(): string { return this.#address; }


    /**
     *  The [[SigningKey]] used for signing payloads.
     */
    get signingKey(): SigningKey { return this.#signingKey; }

    /**
     *  The private key for this wallet.
     */
    get privateKey(): string { return this.signingKey.privateKey; }

    async getAddress(): Promise<string> { return this.#address; }

    connect(provider: null | Provider): BaseWallet {
        return new BaseWallet(this.#signingKey, provider);
    }

    async signTransaction(tx: QuaiTransactionRequest ): Promise<string> {
        // Replace any Addressable or ENS name with an address
        const { to, from } = await resolveProperties({
            to: (tx.to ? resolveAddress(tx.to): undefined),
            from: (tx.from ? resolveAddress(tx.from): undefined)
        });

        if (to != null) { tx.to = to; }
        if (from != null) { tx.from = from; }

        if (tx.from != null) {
            assertArgument(getAddress(<string>(tx.from)) === this.#address,
                "transaction from address mismatch", "tx.from", tx.from);
//            delete tx.from;
        }

        const btx = QuaiTransaction.from(<QuaiTransactionLike>tx);

        btx.signature = this.signingKey.sign(btx.unsignedHash);

        return btx.serialized;
    }


    async signMessage(message: string | Uint8Array): Promise<string> {
        return this.signMessageSync(message);
    }

    // @TODO: Add a secialized signTx and signTyped sync that enforces
    // all parameters are known?
    /**
     *  Returns the signature for %%message%% signed with this wallet.
     */
    signMessageSync(message: string | Uint8Array): string {
        return this.signingKey.sign(hashMessage(message)).serialized;
    }

    async signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
        return this.signingKey.sign(TypedDataEncoder.hash(domain, types, value)).serialized;
    }
}
