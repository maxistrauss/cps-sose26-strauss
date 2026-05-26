// Begin: output
#define IOTEMPOWER_COMMAND_OUTPUT
#include <dev_output.h>
#define output_(internal_name, ...) \
    IOTEMPOWER_DEVICE_(Output, internal_name, ##__VA_ARGS__)
#define output(name, ...) IOTEMPOWER_DEVICE(name, output_, ##__VA_ARGS__)
#define out_(gcc_va_args...) output_(gcc_va_args)
#define out(gcc_va_args...) output(gcc_va_args)
#define led_(gcc_va_args...) output_(gcc_va_args)
#define led(gcc_va_args...) output(gcc_va_args)
#define relais_(gcc_va_args...) output_(gcc_va_args)
#define relais(gcc_va_args...) output(gcc_va_args)
#define relay_(gcc_va_args...) output_(gcc_va_args)
#define relay(gcc_va_args...) output(gcc_va_args)
// End: output

// Begin: input_base
#define IOTEMPOWER_COMMAND_INPUT_BASE
#include <dev_input_base.h>
/* only base class */
// End: input_base

// Begin: input
#define IOTEMPOWER_COMMAND_INPUT
#include <dev_input_digital.h>
#define input_(internal_name, ...) \
    IOTEMPOWER_DEVICE_(Input, internal_name, ##__VA_ARGS__)
#define input(name, ...) IOTEMPOWER_DEVICE(name, input_, ##__VA_ARGS__)
#define button_(gcc_va_args...) input_(gcc_va_args)
#define button(gcc_va_args...) input(gcc_va_args)
#define contact_(gcc_va_args...) input_(gcc_va_args)
#define contact(gcc_va_args...) input(gcc_va_args)
// End: input

// Begin: servo_switch
#define IOTEMPOWER_COMMAND_SERVO_SWITCH
#include <dev_servo_switch.h>
#define servo_switch_(internal_name, ...) \
    IOTEMPOWER_DEVICE_(Servo_Switch, internal_name, ##__VA_ARGS__)
#define servo_switch(name, ...) IOTEMPOWER_DEVICE(name, servo_switch_, ##__VA_ARGS__)
// End: servo_switch

// Begin: display
#define IOTEMPOWER_COMMAND_DISPLAY
#include <dev_display_i2c.h>
#define display_(internal_name, ...) \
    IOTEMPOWER_DEVICE_(Display, internal_name, ##__VA_ARGS__)
#define display(name, ...) IOTEMPOWER_DEVICE(name, display_, ##__VA_ARGS__)
// End: display

// Begin: display44780
#define IOTEMPOWER_COMMAND_DISPLAY44780
#include <dev_display_i2c.h>
#define display44780_(internal_name, ...) \
    IOTEMPOWER_DEVICE_(Display_HD44780_I2C, internal_name, ##__VA_ARGS__)
#define display44780(name, ...) IOTEMPOWER_DEVICE(name, display44780_, ##__VA_ARGS__)
// End: display44780

// Begin: sleep_mgr
#define IOTEMPOWER_COMMAND_SLEEP_MGR
#include <dev_sleep_mgr.h>
#define sleep_mgr_(internal_name, ...) \
    IOTEMPOWER_DEVICE_(SleepManager, internal_name, ##__VA_ARGS__)
#define sleep_mgr(name, ...) IOTEMPOWER_DEVICE(name, sleep_mgr_, ##__VA_ARGS__)
#define sleep_manager_(gcc_va_args...) sleep_mgr_(gcc_va_args)
#define sleep_manager(gcc_va_args...) sleep_mgr(gcc_va_args)
#define power_mgmt_(gcc_va_args...) sleep_mgr_(gcc_va_args)
#define power_mgmt(gcc_va_args...) sleep_mgr(gcc_va_args)
// End: sleep_mgr

