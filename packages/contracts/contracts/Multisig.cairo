# SPDX-License-Identifier: MIT
%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin
# from openzeppelin_cairo.introspection.ERC165 import ERC165_supports_interface
from starkware.cairo.common.memcpy import memcpy
from starkware.cairo.common.alloc import alloc
from starkware.starknet.common.syscalls import call_contract
from starkware.cairo.common.hash import hash2

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
func pk(idx : felt) -> (pk : felt):
end

@storage_var
func pk_len() -> (len : felt):
end

@storage_var
func approvals(calldata_hash : felt, signer : felt) -> (approved : felt):
end

@storage_var
func n_approvals(calldata_hash : felt) -> (n_approvals : felt):
end

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        pk1 : felt, pk2 : felt):
    # TODO move this to an array
    pk.write(1, pk1)
    pk.write(2, pk2)
    pk_len.write(2)
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

    # TODO validate signatures
    let (tx_hash) = _compute_tx_hash(call_array_len, call_array, calldata_len, calldata, nonce)

    # TMP: Convert `AccountCallArray` to 'Call'.
    let (calls : Call*) = alloc()
    from_call_array_to_call(call_array_len, call_array, calldata, calls)
    let calls_len = call_array_len

    let (response : felt*) = alloc()
    let (response_len) = execute_list(calls_len, calls, response)

    return (response_len, response)
end

func _compute_tx_hash{
        syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr,
        ecdsa_ptr : SignatureBuiltin*}(
        call_array_len : felt, call_array : AccountCallArray*, calldata_len : felt,
        calldata : felt*, nonce : felt) -> (hash : felt):
    alloc_locals

    let (res1) = _compute_call_array_hash(call_array_len, call_array)
    let (res2) = _compute_calldata_hash(calldata_len, calldata)

    let (res) = hash2{hash_ptr=pedersen_ptr}(res1, res2)

    return (res)
end

func _compute_call_array_hash{pedersen_ptr : HashBuiltin*}(
        call_array_len : felt, call_array : AccountCallArray*) -> (hash : felt):
    alloc_locals

    if call_array_len == 0:
        return (0)
    end

    let (res) = _compute_call_array_hash(call_array_len - 1, call_array + AccountCallArray.SIZE)
    let (res) = hash2{hash_ptr=pedersen_ptr}(call_array.to, res)
    let (res) = hash2{hash_ptr=pedersen_ptr}(call_array.selector, res)
    let (res) = hash2{hash_ptr=pedersen_ptr}(call_array.data_offset, res)
    let (res) = hash2{hash_ptr=pedersen_ptr}(call_array.data_len, res)

    return (res)
end

func _compute_calldata_hash{pedersen_ptr : HashBuiltin*}(calldata_len : felt, calldata : felt*) -> (
        hash : felt):
    alloc_locals

    if calldata_len == 0:
        return (0)
    end

    let (res) = _compute_calldata_hash(calldata_len - 1, calldata + 1)
    let (res) = hash2{hash_ptr=pedersen_ptr}([calldata], res)

    return (res)
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
