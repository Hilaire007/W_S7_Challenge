import React, { useEffect, useState } from "react";
import axios from "axios";
import * as yup from "yup";

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: "full name must be at least 3 characters",
  fullNameTooLong: "full name must be at most 20 characters",
  sizeIncorrect: "size must be S or M or L",
};

// 👇 Here you will create your schema.

const formSchema = yup.object().shape({
  fullName: yup
    .string()
    .trim()
    .required(validationErrors.fullNameRequired)
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong),
  size: yup
    .string()
    .trim()
    .oneOf(["S", "M", "L"], validationErrors.sizeIncorrect)
    .required(validationErrors.sizeIncorrect),
});

const getInitialValues = () => ({
  fullName: "",
  size: "",
  toppings: [],
});

const getInitialErrors = () => ({
  fullName: "",
  size: "",
});

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: "1", text: "Pepperoni" },
  { topping_id: "2", text: "Green Peppers" },
  { topping_id: "3", text: "Pineapple" },
  { topping_id: "4", text: "Mushrooms" },
  { topping_id: "5", text: "Ham" },
];

export default function Form() {
  const [formData, setFormData] = useState(getInitialValues());
  const [errors, setErrors] = useState(getInitialErrors());
  const [serverSuccess, setServerSuccess] = useState();
  const [serverFailure, setServerFailure] = useState();
  const [enableForm, setEnableForm] = useState(false);

  useEffect(() => {
    formSchema.isValid(formData).then(setEnableForm);
  }, [formData]);

  const onChange = (evt) => {
    let { type, name, value, checked } = evt.target;
    console.log(evt.target);
    value = type == "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: value });
    if (type !== "checkbox") {
      yup
        .reach(formSchema, name)
        .validate(value)
        .then(() => setErrors({ ...errors, [name]: "" }))
        .catch((err) => setErrors({ ...errors, [name]: err.errors[0] }));
    }
    if (type === "checkbox") {
      //retain values of the previous toppings
      if (formData.toppings.includes(evt.target.value)) return;
      setFormData({
        ...formData,
        toppings: [...formData.toppings, evt.target.value],
      });
    }
  };

  const onSubmit = (evt) => {
    evt.preventDefault();
    axios
      .post("http://localhost:9009/api/order", formData)
      .then((res) => {
        console.log("this is the before", formData);
        setFormData({
          fullName: "",
          size: "",
          toppings: [],
        });
        console.log("this is the after", formData);
        setServerSuccess(res.data.message);
      })
      .catch((err) => {
        setServerFailure(err.response.data.message);
        setServerSuccess();
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {serverSuccess && <div className="success">{serverSuccess}</div>}
      {serverFailure && <div className="failure">{serverFailure}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label>
          <br />
          <input
            value={formData.fullName}
            onChange={onChange}
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Type full name"
          />
        </div>
        {errors.fullName && <div className="error">{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label>
          <br />
          <select onChange={onChange} name="size" id="size">
            <option value="">----Choose Size----</option>
            {/* Fill out the missing options */}
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
        {errors.size && <div className="error">{errors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppings.map((topping) => (
          <div key={topping.topping_id}>
            <input
              onChange={onChange}
              value={topping.topping_id}
              type="checkbox"
              id={topping.text}
              name={topping.text}
            />
            <label key={topping.topping_id}>{topping.text}</label>
          </div>
        ))}
      </div>

      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input disabled={!enableForm} type="submit" />
    </form>
  );
}
