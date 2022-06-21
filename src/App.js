import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = "https://api.todoist.com/rest/v1/tasks";
const COMLETED_URL = "https://api.todoist.com/sync/v8/completed/get_all";

/*
 * Plan:
 *   1. Define backend url
 *   2. Get items and show them +
 *   3. Toggle item done +
 *   4. Handle item add +
 *   5. Delete +
 *   6. Filter
 *
 * */

function App() {
  const [itemToAdd, setItemToAdd] = useState("");
  const [items, setItems] = useState([]);
  const [competedTasks, setCompleted] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const handleChangeItem = (event) => {
    setItemToAdd(event.target.value);
  };

  const handleAddItem = () => {
    axios
      .post(
        `${BACKEND_URL}`,
        {
          content: itemToAdd,
          done: false,
        },
        {
          headers: {
            Authorization: `Bearer bea63fa75b4cf0fb92de96b541878613c26ca151`,
          },
        }
      )
      .then((response) => {
        setItems([...items, response.data]);
      });
    setItemToAdd("");
  };

  const toggleItemDone = (item) => {
    const { id, completed } = item;
    if (item.completed_date) {
      axios
        .post(
          `${BACKEND_URL}/${item.task_id}/reopen`,
          {},
          {
            headers: {
              Authorization: `Bearer bea63fa75b4cf0fb92de96b541878613c26ca151`,
            },
          }
        )
        .then((response) => {
          setItems(
            items.map((item) => {
              if (item.id === id) {
                return {
                  ...item,
                  completed: !completed,
                };
              }
              return item;
            })
          );
        });
    } else {
      axios
        .post(
          `${BACKEND_URL}/${id}/close`,
          {
            completed: !completed,
          },
          {
            headers: {
              Authorization: `Bearer bea63fa75b4cf0fb92de96b541878613c26ca151`,
            },
          }
        )
        .then((response) => {
          setCompleted(
            competedTasks.map((item) => {
              if (item.id === id) {
                return {
                  ...item,
                  completed: !completed,
                };
              }
              return item;
            })
          );
        });
    }
  };

  // N => map => N
  // N => filter => 0...N
  const handleItemDelete = (item) => {
    const {id} = item
    axios
      .delete(`${BACKEND_URL}/${id}`, {
        headers: {
          Authorization: `Bearer bea63fa75b4cf0fb92de96b541878613c26ca151`,
        },
      })
      .then((response) => {
        if (item.completed_date) {
          const newItems = competedTasks.filter((i) => {
            return id !== i.id;
          });
          setCompleted(newItems);

        } else {
          const newItems = items.filter((i) => {
            return id !== i.id;
          });
          setItems(newItems);
        }
      });
  };

  useEffect(() => {
    //
    axios
      .get(`${COMLETED_URL}`, {
        headers: {
          Authorization: `Bearer bea63fa75b4cf0fb92de96b541878613c26ca151`,
        },
      })
      .then((response) => {
        setCompleted(response.data.items);
      });

    axios
      .get(`${BACKEND_URL}`, {
        headers: {
          Authorization: `Bearer bea63fa75b4cf0fb92de96b541878613c26ca151`,
        },
      })
      .then((response) => {
        setItems(response.data);
      });
  }, [searchValue]);

  console.log(competedTasks);

  return (
    <div className="todo-app">
      {/* App-header */}
      <div className="app-header d-flex">
        <h1>Todo List</h1>
      </div>

      <div className="top-panel d-flex">
        {/* Search-panel */}
        <input
          type="text"
          className="form-control search-input"
          placeholder="type to search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
      </div>

      {/* List-group */}
      <p></p>
      <h6>ACTIVE TASKS</h6>

      <ul className="list-group todo-list">
        {items.length > 0 ? (
          items.map((item) => (
            <li key={item.id} className="list-group-item">
              <span className={`todo-list-item`}>
                <span
                  className="todo-list-item-label"
                  onClick={() => toggleItemDone(item)}
                >
                  {item.content}
                </span>

                <button
                  type="button"
                  className="btn btn-outline-success btn-sm float-right"
                >
                  <i className="fa fa-exclamation" />
                </button>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm float-right"
                  onClick={() => handleItemDelete(item)}
                >
                  <i className="fa fa-trash-o" />
                </button>
              </span>
            </li>
          ))
        ) : (
          <div>No todos🤤</div>
        )}
      </ul>

      <p></p>
      <h6>COMPLETED TASKS</h6>

      <ul className="list-group todo-list">
        {competedTasks.length > 0 ? (
          competedTasks.map((item) => (
            <li key={item.id} className="list-group-item">
              <span className={`todo-list-item done`}>
                <span
                  className="todo-list-item-label"
                  onClick={() => toggleItemDone(item)}
                >
                  {item.content}
                </span>

                <button
                  type="button"
                  className="btn btn-outline-success btn-sm float-right"
                >
                  <i className="fa fa-exclamation" />
                </button>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm float-right"
                  onClick={() => handleItemDelete(item)}
                >
                  <i className="fa fa-trash-o" />
                </button>
              </span>
            </li>
          ))
        ) : (
          <div>No Completed todos🤤</div>
        )}
      </ul>

      {/* Add form */}
      <div className="item-add-form d-flex">
        <input
          value={itemToAdd}
          type="text"
          className="form-control"
          placeholder="What needs to be done"
          onChange={handleChangeItem}
        />
        <button className="btn btn-outline-secondary" onClick={handleAddItem}>
          Add item
        </button>
      </div>
    </div>
  );
}

export default App;
