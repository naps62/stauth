%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math import assert_le

@storage_var
func counter() -> (value : felt):
end

@storage_var
func max_inc() -> (value : felt):
end

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        initial : felt, max : felt):
    max_inc.write(max)
    counter.write(initial)
    return ()
end

@view
func read{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (value : felt):
    let (value) = counter.read()
    return (value)
end

@external
func increment{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(inc : felt):
    let (max) = max_inc.read()
    assert_le(inc, max)
    let (current) = counter.read()
    counter.write(current + inc)
    return ()
end

@external
func increment_one{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():
    let (max) = max_inc.read()
    let (current) = counter.read()
    counter.write(current + 1)
    return ()
end

func _increment(value : felt, inc : felt) -> (new_value : felt):
    tempvar foo = (value + inc)

    return (foo)
end
