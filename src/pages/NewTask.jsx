import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import DateTimePicker from "react-datetime-picker";
import axios from "axios";
import { url } from "../const";
import { Header } from "../components/Header";
import "./newTask.scss";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";

export const NewTask = () => {
  const [selectListId, setSelectListId] = useState();
  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [limit, setLimit] = useState(new Date());
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  const navigate = useNavigate();
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleSelectList = (id) => setSelectListId(id);
  const handleLimitChange = (date) => setLimit(date);
  const onCreateTask = () => {
    const data = {
      title,
      detail,
      limit,
      done: false,
    };

    axios
      .post(`${url}/lists/${selectListId}/tasks`, data, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        setErrorMessage(`タスクの作成に失敗しました。${err}`);
      });
  };

  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
        setSelectListId(res.data[0]?.id);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, []);

  return (
    <div>
      <Header />
      <main className="new-task">
        <h2>タスク新規作成</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="new-task-form">
          <label htmlFor="new-task-select-list">リスト</label>
          <br />
          <select
            onChange={(e) => handleSelectList(e.target.value)}
            id="new-task-select-list"
            className="new-task-select-list"
          >
            {lists.map((list) => (
              <option key={list.id} className="list-item" value={list.id}>
                {list.title}
              </option>
            ))}
          </select>
          <br />
          <label htmlFor="new-task-title">タイトル</label>
          <br />
          <input
            id="new-task-title"
            type="text"
            onChange={handleTitleChange}
            className="new-task-title"
          />
          <br />
          <label htmlFor="new-task-detail">詳細</label>
          <br />
          <textarea
            id="new-task-detail"
            onChange={handleDetailChange}
            className="new-task-detail"
          />
          <br />
          <label htmlFor="new-task-outline">期限</label>
          <br />
          <DateTimePicker
            id="new-task-outline"
            onChange={handleLimitChange}
            value={limit}
          />
          <br />
          <button
            type="button"
            className="new-task-button"
            onClick={onCreateTask}
          >
            作成
          </button>
        </form>
      </main>
    </div>
  );
};
