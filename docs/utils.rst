=========
Utilities
=========
``plasma-utils.utils`` provides miscellaneous utilities often used when interacting with plasma chains.

.. code-block:: javascript

    const utils = require('plasma-utils').utils

-----------------------------------------------------------------------------

int32ToHex
==========

.. code-block:: javascript

    utils.int32ToHex(x)

Converts a 32 byte integer to a hex string.

----------
Parameters
----------

1. ``x`` - ``number``: A 32 byte integer.

-------
Returns
-------

``string``: The integer represented as a hex string.
