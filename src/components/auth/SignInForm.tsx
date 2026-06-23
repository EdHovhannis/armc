import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import * as React from 'react';

export interface SignInFormState {
  username: string;
  password: string;
}

export interface SignInFormProps {
  onSignInClicked(username: string, password: string);
}

export default class SignInForm extends React.Component<SignInFormProps, SignInFormState> {
  state = {
    username: '',
    password: '',
  };

  constructor(props) {
    super(props);
  }

  handleSignIn = (username, password) => {
    this.props.onSignInClicked(username, password);
  };

  render() {
    return (
      <React.Fragment>
        <form
          style={{ width: '100%', marginTop: 10 }}
          onSubmit={(e) => {
            e.preventDefault();
            this.handleSignIn(this.state.username, this.state.password);
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            style={{
              marginTop: 12,
            }}
          >
            Войти
          </Button>
        </form>
      </React.Fragment>
    );
  }
}
