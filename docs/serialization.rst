=============
Serialization
=============

Description
===========
``plasma-utils.serialization`` provides utilities for encoding and decoding transactions.
It also provides tools for defining your own custom schemas using our encoding scheme.

Schemas
=======
.. code-block: javascript

    const TransferRecordSchema = new Schema({
        sender: {
            type: Address,
            required: true
        },
        recipient: {
            type: Address,
            required: true
        },
        token: {
            type: ByteArray,
            length: 4,
            required: true
        },
        start: {
            type: ByteArray,
            length: 12,
            required: true
        },
        end: {
            type: ByteArray,
            length: 12,
            required: true
        },
        block: {
            type: ByteArray,
            length: 32,
            required: true
        }
    })

A `TransferRecord` represents a portion of a transaction.
Each transaction is composed of one or more `TransferRecords`.
By allowing a transaction to support more than one transfer, we enable atomic swaps.

-----------------------------------------------------------------------------

.. code-block: javascript

    const SignatureSchema = new Schema({
        v: {
            type: ByteArray,
            length: 1,
            required: true
        },
        r: {
            type: ByteArray,
            length: 32,
            required: true
        },
        s: {
            type: ByteArray,
            length: 32,
            required: true
        }
    })

A `Signature` is a simple representation of an ECDSA signature.

------------------------------------------------------------------------------

.. code-block: javascript

    const TransactionSchema = new Schema({
        transfer: {
            type: TransferRecordSchema
        },
        signature: {
            type: SignatureSchema
        }
    })

A `Transaction` is composed of one or more `Transfer` objects and a signature for each transfer.
