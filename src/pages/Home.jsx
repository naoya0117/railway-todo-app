import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { Header } from "../components/Header";
import { url } from "../const";
import "./home.scss";

export const Home = () => {
  const [isDoneDisplay, setIsDoneDisplay] = useState("todo"); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  const [activeTab, setActiveTab] = useState("");

  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);

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
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, []);

  useEffect(() => {
    const listId = lists[0]?.id;
    if (typeof listId !== "undefined") {
      setSelectListId(listId);
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          setTasks(res.data.tasks);
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`);
        });
    }
  }, [lists]);

  const handleSelectList = (id) => {
    setSelectListId(id);
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setTasks(res.data.tasks);
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const index = lists.findIndex((list) => list.id === activeTab);
      let newIndex = index;

      if (e.key === "ArrowRight") {
        newIndex = index + 1 >= lists.length ? 0 : index + 1;
      } else if (e.key === "ArrowLeft") {
        newIndex = index - 1 < 0 ? lists.length - 1 : index - 1;
      }

      if (index !== newIndex) {
        setActiveTab(lists[newIndex].id);
        handleSelectList(lists[newIndex].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, lists]);

  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>
          <ul className="list-tab" role="tablist">
            {lists.map((list) => {
              const isActive = list.id === selectListId;
              return (
                <li>
                  <button
                    role="tab"
                    aria-selected={isActive ? "true" : "false"}
                    tabIndex={isActive ? "-1" : "0"}
                    type="button"
                    key={list.id}
                    className={`list-tab-item ${isActive ? "active" : ""}`}
                    onClick={() => handleSelectList(list.id)}
                  >
                    {list.title}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks
              tasks={tasks}
              selectListId={selectListId}
              isDoneDisplay={isDoneDisplay}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// 表示するタスク
/**
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const Tasks = (props) => {
  const { tasks, selectListId, isDoneDisplay } = props;

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calcRemainingTime = (limit) => {
    const limitDate = new Date(limit);
    const remainingTime = limitDate - now;
    const remainingDay = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const remainingHour = Math.floor(
      (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const remainingMinute = Math.floor(
      (remainingTime % (1000 * 60 * 60)) / (1000 * 60),
    );

    if (remainingTime < 0) {
      return "期限切れ";
    }

    return `${remainingDay}日${remainingHour}時間${remainingMinute}分`;
  };

  if (tasks === null) return null;

  if (isDoneDisplay === "done") {
    return (
      <ul>
        {tasks
          .filter((task) => task.done === true)
          .map((task) => (
            <li key={task.id} className="task-item">
              <Link
                to={`/lists/${selectListId}/tasks/${task.id}`}
                className="task-item-link"
              >
                {task.title}
                <br />
                {task.limit}
                <br />
                {task.done ? "完了" : "未完了"}
              </Link>
            </li>
          ))}
      </ul>
    );
  }

  return (
    <ul>
      {tasks
        .filter((task) => task.done === false)
        .map((task) => (
          <li key={task.id} className="task-item">
            <Link
              to={`/lists/${selectListId}/tasks/${task.id}`}
              className="task-item-link"
            >
              {task.title}
              <br />
              {task.limit}
              <br />
              {calcRemainingTime(task.limit)}
              <br />
              {task.done ? "完了" : "未完了"}
            </Link>
          </li>
        ))}
    </ul>
  );
};

Tasks.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      done: PropTypes.bool,
    }),
  ),
  selectListId: PropTypes.string,
  isDoneDisplay: PropTypes.string,
};

Tasks.defaultProps = {
  tasks: [],
  selectListId: "",
  isDoneDisplay: null,
};
