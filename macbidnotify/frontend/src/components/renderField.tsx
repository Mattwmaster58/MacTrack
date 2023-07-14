import {Config, FieldProps, MuiWidgets} from '@react-awesome-query-builder/mui';
const {MuiFieldSelect} = MuiWidgets
const renderField = (props?: FieldProps<Config>) => {
    return <MuiFieldSelect {...props}/> as unknown as typeof MuiFieldSelect;
}

export default renderField;