# SPDX-License-Identifier: MIT
%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin
# from openzeppelin_cairo.introspection.ERC165 import ERC165_supports_interface
from starkware.cairo.common.memcpy import memcpy
from starkware.cairo.common.alloc import alloc
from starkware.starknet.common.syscalls import call_contract, get_tx_info
from starkware.cairo.common.signature import verify_ecdsa_signature
from starkware.cairo.common.hash import hash2
from starkware.cairo.common.math import assert_not_equal
from merkle import merkle_verify

#
# Structs
#

# Copied from openzeppelin
struct Call:
    member to : felt
    member selector : felt
    member calldata_len : felt
    member calldata : felt*
end

# Copied from openzeppelin
# Tmp struct introduced while we wait for Cairo
# to support passing `[AccountCall]` to __execute__
struct AccountCallArray:
    member to : felt
    member selector : felt
    member data_offset : felt
    member data_len : felt
end

#
# View functions
#

# TODO list of public keys
# TODO nonce
# TODO list of pending txs
# TODO list of eth accounts that can approve

@storage_var
func pub_keys(idx : felt) -> (pk : felt):
end

@storage_var
func pub_keys_len() -> (len : felt):
end

@storage_var
func _nonce() -> (nonce : felt):
end

@storage_var
func n() -> (n : felt):
end

@storage_var
func merkle_root() -> (n : felt):
end

@storage_var
func spent_leafs(root : felt, id : felt) -> (spent : felt):
end

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        _n : felt, pk : felt, _merkle_root : felt):
    # TODO move this to an array
    n.write(_n)
    pub_keys.write(1, pk)
    merkle_root.write(_merkle_root)
    pub_keys_len.write(2)
    return ()
end

#
# External functions
#

@external
func __execute__{
        syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr,
        ecdsa_ptr : SignatureBuiltin*}(
        call_array_len : felt, call_array : AccountCallArray*, calldata_len : felt,
        calldata : felt*, nonce : felt) -> (response_len : felt, response : felt*):
    alloc_locals

    %{ print("execute") %}
    # TODO validate signatures
    let (tx_info) = get_tx_info()
    let (n_sigs) = n.read()
    validate_signatures(tx_info.transaction_hash, tx_info.signature_len, tx_info.signature, 1)

    # TMP: Convert `AccountCallArray` to 'Call'.
    let (calls : Call*) = alloc()
    from_call_array_to_call(call_array_len, call_array, calldata, calls)
    let calls_len = call_array_len

    let (response : felt*) = alloc()
    let (response_len) = execute_list(calls_len, calls, response)

    let (current_nonce) = _nonce.read()
    assert nonce = current_nonce
    _nonce.write(current_nonce + 1)

    return (response_len, response)
end

func validate_signatures{
        syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, ecdsa_ptr : SignatureBuiltin*,
        range_check_ptr}(
        message : felt, signatures_len : felt, signatures : felt*, next : felt) -> ():
    alloc_locals

    let (signer) = pub_keys.read(1)
    verify_ecdsa_signature(
        message=message, public_key=signer, signature_r=signatures[0], signature_s=signatures[1])

    let merkle_leaf = [signatures + 2]
    let merkle_proof_len = [signatures + 3]
    let merkle_proof = signatures + 4
    let (_merkle_root) = merkle_root.read()

    %{ print("here") %}

    let (spent) = spent_leafs.read(_merkle_root, merkle_leaf)
    assert_not_equal(spent, 1)
    let (valid) = merkle_verify(merkle_leaf, _merkle_root, merkle_proof_len, merkle_proof)
    assert valid = 1
    spent_leafs.write(_merkle_root, merkle_leaf, 1)

    return ()
end

func execute_list{syscall_ptr : felt*}(calls_len : felt, calls : Call*, response : felt*) -> (
        response_len : felt):
    alloc_locals

    if calls_len == 0:
        return (0)
    end

    # do the current call
    let this : Call = [calls]
    let res = call_contract(this.to, this.selector, this.calldata_len, this.calldata)

    # copy result in response
    memcpy(response, res.retdata, res.retdata_size)

    # recursive call
    let (response_len) = execute_list(calls_len - 1, calls + Call.SIZE, response + res.retdata_size)

    return (response_len + res.retdata_size)
end

func from_call_array_to_call{syscall_ptr : felt*}(
        call_array_len : felt, call_array : AccountCallArray*, calldata : felt*, calls : Call*):
    # if no more calls
    if call_array_len == 0:
        return ()
    end

    # parse the current call
    assert [calls] = Call(
        to=[call_array].to,
        selector=[call_array].selector,
        calldata_len=[call_array].data_len,
        calldata=calldata + [call_array].data_offset
        )

    # parse the remaining calls recursively
    from_call_array_to_call(
        call_array_len - 1, call_array + AccountCallArray.SIZE, calldata, calls + Call.SIZE)
    return ()
end

#
# Views
#

@view
func nonce{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (nonce : felt):
    let (nonce) = _nonce.read()
    return (nonce)
end