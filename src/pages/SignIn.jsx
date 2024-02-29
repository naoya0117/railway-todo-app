import { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Header } from "../components/Header";
import "./signin.scss";
import { signIn } from "../authSlice";
import { url } from "../const";

export const SignIn = () => {
  const auth = useSelector((state) => state.auth.isSignIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [, setCookie] = useCookies();
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const onSignIn = () => {
    axios.post(`${url}/signin`, { email, password }).then(
      ((res) => {
        setCookie("token", res.data.token);
        dispatch(signIn());
        navigate("/");
      })
    ).catch((err) => {
      setErrorMessage(`サインインに失敗しました。${err}`);
    });

  };

  if (auth) navigate("/");

  return (
    <div>
      <Header />
      <main className="signin">
        <h2>サインイン</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="signin-form">
          <label htmlFor="email-input" className="email-label">
            メールアドレス
          </label>
          <br />
          <input
            id="email-input"
            type="email"
            className="email-input"
            onChange={handleEmailChange}
          />
          <br />
          <label htmlFor="password-input" className="password-label">
            パスワード
          </label>
          <br />
          <input
            type="password"
            id="password-input"
            className="password-input"
            onChange={handlePasswordChange}
          />
          <br />
          <button type="button" className="signin-button" onClick={onSignIn}>
            サインイン
          </button>
        </form>
        <Link to="/signup">新規作成</Link>
      </main>
    </div>
  );
};
