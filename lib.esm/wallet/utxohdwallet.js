import { N, ShardData } from '../constants';
import { SigningKey } from "../crypto/index.js";
import { Transaction, assertArgument, assertPrivate, computeHmac, dataSlice, defineProperties, getBytes, getNumber, getShardForAddress, hexlify, isBytesLike, isUTXOAddress, randomBytes, ripemd160, sha256, toBeHex, toBigInt } from '../quais.js';
import { Mnemonic } from './mnemonic.js';
import { HardenedBit, derivePath, ser_I } from './utils.js';
import { BaseWallet } from "./base-wallet.js";
import { MuSigFactory } from "@brandonblack/musig";
import { nobleCrypto } from "./musig-crypto.js";
import { schnorr } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
const MasterSecret = new Uint8Array([66, 105, 116, 99, 111, 105, 110, 32, 115, 101, 101, 100]);
const _guard = {};
export class UTXOHDWallet extends BaseWallet {
    /**
    *  The compressed public key.
    */
    #publicKey;
    /**
     *  The fingerprint.
     *
     *  A fingerprint allows quick qay to detect parent and child nodes,
     *  but developers should be prepared to deal with collisions as it
     *  is only 4 bytes.
     */
    fingerprint;
    /**
     *  The parent fingerprint.
     */
    accountFingerprint;
    /**
     *  The mnemonic used to create this HD Node, if available.
     *
     *  Sources such as extended keys do not encode the mnemonic, in
     *  which case this will be ``null``.
     */
    mnemonic;
    /**
     *  The chaincode, which is effectively a public key used
     *  to derive children.
     */
    chainCode;
    /**
     *  The derivation path of this wallet.
     *
     *  Since extended keys do not provider full path details, this
     *  may be ``null``, if instantiated from a source that does not
     *  enocde it.
     */
    path;
    /**
     *  The child index of this wallet. Values over ``2 *\* 31`` indicate
     *  the node is hardened.
     */
    index;
    /**
     *  The depth of this wallet, which is the number of components
     *  in its path.
     */
    depth;
    coinType;
    /**
     * array of addresses/priv keys this current wallet is aware of that were
     * generated by incrementing addressindex in bip44 until specified gap rule
     */
    #utxoAddresses = [];
    get utxoAddresses() {
        return this.#utxoAddresses;
    }
    set utxoAddresses(addresses) {
        this.#utxoAddresses = addresses;
    }
    /**
     * Gets the current publicKey
     */
    get publicKey() {
        return this.#publicKey;
    }
    /**
     *  @private
     */
    constructor(guard, signingKey, accountFingerprint, chainCode, path, index, depth, mnemonic, provider) {
        super(signingKey, provider);
        assertPrivate(guard, _guard);
        this.#publicKey = signingKey.compressedPublicKey;
        const fingerprint = dataSlice(ripemd160(sha256(this.#publicKey)), 0, 4);
        defineProperties(this, {
            accountFingerprint, fingerprint,
            chainCode, path, index, depth
        });
        defineProperties(this, { mnemonic });
    }
    connect(provider) {
        return new UTXOHDWallet(_guard, this.signingKey, this.accountFingerprint, this.chainCode, this.path, this.index, this.depth, this.mnemonic, provider);
    }
    derivePath(path) {
        return derivePath(this, path);
    }
    static #fromSeed(_seed, mnemonic) {
        assertArgument(isBytesLike(_seed), "invalid seed", "seed", "[REDACTED]");
        const seed = getBytes(_seed, "seed");
        assertArgument(seed.length >= 16 && seed.length <= 64, "invalid seed", "seed", "[REDACTED]");
        const I = getBytes(computeHmac("sha512", MasterSecret, seed));
        const signingKey = new SigningKey(hexlify(I.slice(0, 32)));
        const result = new UTXOHDWallet(_guard, signingKey, "0x00000000", hexlify(I.slice(32)), "m", 0, 0, mnemonic, null);
        return result;
    }
    setCoinType() {
        this.coinType = Number(this.path?.split("/")[2].replace("'", ""));
    }
    /**
     *  Creates a new random HDNode.
     */
    static createRandom(path, password, wordlist) {
        if (path == null || !this.isValidPath(path)) {
            throw new Error('Invalid path: ' + path);
        }
        const mnemonic = Mnemonic.fromEntropy(randomBytes(16), password, wordlist);
        return UTXOHDWallet.#fromSeed(mnemonic.computeSeed(), mnemonic).derivePath(path);
    }
    /**
     *  Create an HD Node from %%mnemonic%%.
     */
    static fromMnemonic(mnemonic, path) {
        if (path == null || !this.isValidPath(path)) {
            throw new Error('Invalid path: ' + path);
        }
        return UTXOHDWallet.#fromSeed(mnemonic.computeSeed(), mnemonic).derivePath(path);
    }
    /**
     *  Creates an HD Node from a mnemonic %%phrase%%.
     */
    static fromPhrase(phrase, path, password, wordlist) {
        if (path == null || !this.isValidPath(path)) {
            throw new Error('Invalid path: ' + path);
        }
        const mnemonic = Mnemonic.fromPhrase(phrase, password, wordlist);
        return UTXOHDWallet.#fromSeed(mnemonic.computeSeed(), mnemonic).derivePath(path);
    }
    /**
     * Checks if the provided BIP44 path is valid and limited to the change level.
     * @param path The BIP44 path to check.
     * @returns true if the path is valid and does not include the address_index; false otherwise.
     */
    static isValidPath(path) {
        // BIP44 path regex pattern for up to the 'change' level, excluding 'address_index'
        // This pattern matches paths like "m/44'/0'/0'/0" and "m/44'/60'/0'/1", but not "m/44'/60'/0'/0/0"
        const pathRegex = /^m\/44'\/\d+'\/\d+'\/[01]$/;
        return pathRegex.test(path);
    }
    /**
     *  Return the child for %%index%%.
     */
    deriveChild(_index) {
        const index = getNumber(_index, "index");
        assertArgument(index <= 0xffffffff, "invalid index", "index", index);
        // Base path
        let newDepth = this.depth + 1;
        let path = this.path;
        if (path) {
            let pathFields = path.split("/");
            if (pathFields.length == 6) {
                pathFields.pop();
                path = pathFields.join("/");
                newDepth--;
            }
            path += "/" + (index & ~HardenedBit);
            if (index & HardenedBit) {
                path += "'";
            }
        }
        const { IR, IL } = ser_I(index, this.chainCode, this.#publicKey, this.privateKey);
        const ki = new SigningKey(toBeHex((toBigInt(IL) + BigInt(this.privateKey)) % N, 32));
        //BIP44 if we are at the account depth get that fingerprint, otherwise continue with the current one
        let newFingerprint = this.depth == 3 ? this.fingerprint : this.accountFingerprint;
        return new UTXOHDWallet(_guard, ki, newFingerprint, hexlify(IR), path, index, newDepth, this.mnemonic, this.provider);
    }
    async generateUTXOs(zone, gap = 20) {
        zone = zone.toLowerCase();
        // Check if zone is valid
        const shard = ShardData.find(shard => shard.name.toLowerCase() === zone || shard.nickname.toLowerCase() === zone || shard.byte.toLowerCase() === zone);
        if (!shard) {
            throw new Error("Invalid zone");
        }
        /*
        generate addresses by incrementing address index in bip44
        check each address for utxos and add to utxoAddresses
        until we have had gap limit number of addresses with no utxos
        */
        let currentUtxoAddresses = [];
        let empty = 0;
        let accIndex = 0;
        while (empty < gap) {
            const wallet = this.deriveAddress(accIndex, zone);
            const pubKey = wallet.address;
            const privKey = wallet.privateKey;
            /*check available utxos throught node JSONRPC call
                if we have utxos at this address add it to currentUtxoAddresses
            */
            currentUtxoAddresses.push({ pubKey, privKey });
            //reset empty = 0
            //else increment empty untill we have gap amount 
            empty++;
            //increment addrIndex in bip44 always
            accIndex++;
        }
        this.utxoAddresses = currentUtxoAddresses;
    }
    /**
     * Derives address by incrementing address_index according to BIP44
     */
    deriveAddress(index, zone) {
        if (!this.path)
            throw new Error("Missing Path");
        //Case for a non quai/qi wallet where zone is not needed
        if (!zone) {
            return this.derivePath(this.path + "/" + index.toString());
        }
        zone = zone.toLowerCase();
        // Check if zone is valid
        const shard = ShardData.find(shard => shard.name.toLowerCase() === zone || shard.nickname.toLowerCase() === zone || shard.byte.toLowerCase() === zone);
        if (!shard) {
            throw new Error("Invalid zone");
        }
        let newWallet;
        let addrIndex = 0;
        let zoneIndex = index + 1;
        do {
            newWallet = this.derivePath(addrIndex.toString());
            if (getShardForAddress(newWallet.address) == shard && ((newWallet.coinType == 969) == isUTXOAddress(newWallet.address)))
                zoneIndex--;
            addrIndex++;
        } while (zoneIndex > 0);
        return newWallet;
    }
    async signTransaction(tx) {
        const txobj = Transaction.from(tx);
        if (!txobj.inputsUTXO || !txobj.outputsUTXO)
            throw new Error('Invalid UTXO transaction, missing inputs or outputs');
        const hash = keccak_256(txobj.unsignedSerialized);
        const musig = MuSigFactory(nobleCrypto);
        if (txobj.inputsUTXO.length == 1) {
            const pubKey = txobj.inputsUTXO[0].address;
            const privKey = this.utxoAddresses.find(utxoAddr => utxoAddr.pubKey === pubKey)?.privKey;
            if (!privKey)
                throw new Error(`Missing private key for ${pubKey}`);
            const signature = schnorr.sign(hash, BigInt(privKey));
            return hexlify(signature);
        }
        else {
            const privKeys = txobj.inputsUTXO.map(input => {
                const utxoAddrObj = this.utxoAddresses.find(utxoAddr => utxoAddr.pubKey === input.address);
                return utxoAddrObj ? utxoAddrObj.privKey : null;
            }).filter(privKey => privKey !== null);
            const pubKeys = privKeys.map(privKey => nobleCrypto.getPublicKey(getBytes(privKey), true)).filter(pubKey => pubKey !== null);
            //const aggPublicKey = musig.getPlainPubkey(musig.keyAgg(pubKeys));
            const nonces = pubKeys.map(pk => musig.nonceGen({ publicKey: getBytes(pk) }));
            const aggNonce = musig.nonceAgg(nonces);
            const signingSession = musig.startSigningSession(aggNonce, hash, pubKeys);
            //Each signer creates a partial signature
            const partialSignatures = privKeys.map((sk, index) => musig.partialSign({
                secretKey: getBytes(sk || ''),
                publicNonce: nonces[index],
                sessionKey: signingSession,
                verify: true
            }));
            // Aggregate the partial signatures into a final aggregated signature
            const finalSignature = musig.signAgg(partialSignatures, signingSession);
            // //Verify signature using schnorr
            // const isValid = schnorr.verify(finalSignature, hash, aggPublicKey);
            return hexlify(finalSignature);
        }
    }
}
//# sourceMappingURL=utxohdwallet.js.map