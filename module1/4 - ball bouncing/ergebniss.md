## Results – Bouncing Ball Surrogate Model

### Error Metrics

* **Gesamt MSE:** 0.043646
* **MSE Impact (x ≤ 0.01):** 0.007316
* **MSE Zwischenbereich (0.01 < x ≤ 0.1):** 0.293490
* **MSE Far from impact (x > 0.1):** 0.002984

---

### Interpretation

The most interesting region is the **intermediate range (0.01 < x ≤ 0.1)**. While the impact region (x ≤ 0.01) can also show errors, it becomes less relevant over time because the system converges towards a resting state (x ≈ 0, v ≈ 0), making many samples similar and easier to predict.

In contrast, the intermediate region contains the transition between flight and impact, where the velocity changes abruptly. This makes the dynamics non-smooth and difficult for the neural network to learn, resulting in a much higher error.

Far from the ground (x > 0.1), the motion is smooth and therefore easy to approximate.

---

### Conclusion

Smooth flight dynamics are easy to learn, while the impact and especially the transition region are difficult for the model due to the hybrid and discontinuous behavior.
