import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import * as React from 'react';

export interface RegisterFormState {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormProps {
  onRegisterClicked(username: string, password: string);
  onError(message);
}

export default class RegisterForm extends React.Component<RegisterFormProps, RegisterFormState> {
  state = {
    username: '',
    password: '',
    confirmPassword: '',
  };

  handleRegister() {
    if (this.state.password !== this.state.confirmPassword) this.props.onError('Введённые пароли не совпадают');
    else this.props.onRegisterClicked(this.state.username, this.state.password);
  }

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <form
          style={{ width: '100%', marginTop: 10 }}
          onSubmit={(event) => {
            event.preventDefault();
            this.handleRegister();
          }}
        >
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="username">Имя пользователя</InputLabel>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              defaultValue={this.state.username}
              onChange={(event) =>
                this.setState({
                  username: event.target.value,
                })
              }
              autoFocus
            />
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="password">Пароль</InputLabel>
            <Input
              name="password"
              type="password"
              id="password"
              defaultValue={this.state.password}
              onChange={(event) =>
                this.setState({
                  password: event.target.value,
                })
              }
              autoComplete="current-password"
            />
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="password">Повторите пароль</InputLabel>
            <Input
              name="password"
              type="password"
              id="password"
              defaultValue={this.state.confirmPassword}
              onChange={(event) =>
                this.setState({
                  confirmPassword: event.target.value,
                })
              }
              autoComplete="current-password"
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            style={{
              marginTop: 12,
            }}
          >
            Регистрация
          </Button>
        </form>
      </React.Fragment>
    );
  }
}
