import numpy as np
import matplotlib.pyplot as plt

def simulate(
    controller="open",
    setpoint=21.0,
    Kp=2.0,
    Ki=0.5,
    Kd=0.5,
    duration_s=20.0,
    plant_dt=0.001,
    control_hz=20,
    sensor_noise_std=0.05,
    disturbance=-2.0,
    u_limit=5.0,
    latency_s=0.0,
    jitter_s=0.0,
    seed=0,
):

    rng = np.random.default_rng(seed)
    n = int(duration_s / plant_dt)
    t = np.arange(n) * plant_dt

    # Room temperature (start below setpoint)
    x = 18.0
    v = 0.0
    d = 0.5

    control_period = 1.0 / control_hz
    next_control_t = 0.0

    integ_e = 0.0
    prev_e = 0.0

    u_queue = []
    u_applied = 0.0

    xs = np.zeros(n)
    ys = np.zeros(n)
    us = np.zeros(n)

    def saturate(val, limit):
        return np.clip(val, 0, limit)

    for i in range(n):
        ti = t[i]

        if u_queue and u_queue[0][0] <= ti:
            _, u_applied = u_queue.pop(0)

        y = x + rng.normal(0.0, sensor_noise_std)

        if ti >= next_control_t:
            e = setpoint - y

            if controller == "open":
                u_cmd = 3.0
            elif controller == "p":
                u_cmd = Kp * e
            # elif controller == "pd": # TODO implement yourself
            elif controller == "pi":
                integ_e += e * control_period
                u_cmd = Kp * e + Ki * integ_e

            prev_e = e
            u_cmd = float(saturate(u_cmd, u_limit))

            extra = rng.uniform(-jitter_s, jitter_s)
            apply_time = ti + max(0.0, latency_s + extra)

            u_queue.append((apply_time, u_cmd))
            u_queue.sort(key=lambda z: z[0])

            next_control_t = ti + control_period

        # Thermal dynamics
        a = -d * v + u_applied + disturbance
        v = v + a * plant_dt
        x = x + v * plant_dt

        xs[i] = x
        ys[i] = y
        us[i] = u_applied

    return t, xs, ys, us


def plot_run(title, t, xs, ys, us):
    plt.figure()
    plt.plot(t, xs, label="Room Temperature")
    plt.plot(t, np.ones_like(t)*21, "--", label="Setpoint (21°C)")
    plt.title(title)
    plt.legend()
    plt.grid(True)

    plt.figure()
    plt.plot(t, us, label="Heating Power")
    plt.title(title + " - Control Signal")
    plt.legend()
    plt.grid(True)


if __name__ == "__main__":

    duration = 20.0

    for ctrl in ["open", "p", "pi"]:
        t, xs, ys, us = simulate(controller=ctrl)
        plot_run(ctrl.upper() + " Controller", t, xs, ys, us)

    plt.show()