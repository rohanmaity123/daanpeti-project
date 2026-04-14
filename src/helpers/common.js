export const handelError = (error, setFormData) => {
  const errors = error.issues;
  console.error(errors);

  errors.length > 0 &&
    errors.forEach((error) => {
      if (error.message !== "") {
        const field = error.path[0] + "Err";

        setFormData((_prevState) => ({
          ..._prevState,
          [field]: true,
          [`${field}Msg`]: error.message,
        }));
      }
    });
};

export const getYearsArray = () => {
  const currentYear = 2030//new Date().getFullYear();
  const startYear = 1980;
  const yearsArray = [];

  for (let year = currentYear; year >= startYear; year--) {
      yearsArray.push(year);
  }

  return yearsArray;
};

export const getMonthsArray = () => {
  const monthsArray = [];

  for (let month = 1; month <= 24; month++) {
    monthsArray.push(month);
  }

  return monthsArray;
};
export const getDaysArray = () => {
  const daysArray = [];

  for (let days = 1; days <= 30; days++) {
    daysArray.push(days);
  }

  return daysArray;
};