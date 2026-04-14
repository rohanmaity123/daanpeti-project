
const Reducer = (state, action) => {
    switch (action.type) {
        case 'ONCHANGE': {
            const { target } = action.payload;
            return {
                ...state,
                [target.name]: target.value,
                loading: false
            };
        }
        case 'ONCHANGE_CHECKBOX': {
            const { target } = action.payload;
            return {
                ...state,
                [target.name]: target.checked,
                loading: false
            };
        }
        case 'SETDATA': {
            const target = action.payload;
            return {
                ...state,
                [target.name]: target.value,
            };
        }
        case 'VALIDATE': {
            return {
                ...state,
                validate: action.payload
            };
        }
        case 'VALIDATECHECK': {
            const target = action.payload;
            return {
                ...state,
                [target.name]: target.value,
            };
        }
        case 'LOAD': {
            return {
                ...state,
                loading: action.payload
            };
        }
        case 'RESET': {
            return action.payload;
        }
        default: {
            return { ...state };
        }
    }
};
export default Reducer;