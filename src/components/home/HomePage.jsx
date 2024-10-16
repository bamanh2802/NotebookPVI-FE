import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllNotebooks, createNotebook, deleteNotebook, updateNotebook, Logout, whoAmI } from '../../service/homePageApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import UserDetail from '../user-profile/UserDetail';
import { Helmet } from 'react-helmet';

import '../../css/homepage/homepage.css';
import '../../css/color.css';
import '../../css/homepage/loadingpage.css'

import UserProfile from '../user-profile/UserProfile'
import Feedback from './Feedback';

function HomePage() {
  const [notebooks, setNotebooks] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedNotebookId, setSelectedNotebookId] = useState(null);
  const [selectedNotebookName, setSelectedNotebookName] = useState('');
  const [dropdownClass, setDropdownClass] = useState('');
  const [isOpenChangeMenu, setIsOpenChangeMenu] = useState(false)
  const [isOpenDeleteMenu, setIsOpenDeleteMenu] = useState(false)
  const [isOpenUserMenu, setIsOpenUserMenu] = useState(false);
  const [notebookCreateLoading, setNotebookCreateLoading] = useState(false)
  const [isOpenUserDetail, setIsOpenUserDetail] = useState(false)
  const [isOpenFeedback, setIsOpenFeedback] = useState(false)

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isChatOpen = useSelector((state) => state.isChatOpen);
  const isOpenSource = useSelector((state) => state.isOpenSource);
  const isTutorialOpen = useSelector((state) => state.isTutorialOpen);
  
  const [isLoadingNotebook, setIsLoadingNotebook] = useState(false);
  const userName = localStorage.getItem("username")

  const toggleDropdown = (event, notebookId, notebookName) => {
    event.stopPropagation();
    if (selectedNotebookId === notebookId && isDropdownOpen) {
      setDropdownClass('fade-out');
      setTimeout(() => {
        setIsDropdownOpen(false);
        setDropdownClass('');
      }, 300); 
    } else {
      setSelectedNotebookId(notebookId);
      setSelectedNotebookName(notebookName)
      setDropdownClass('fade-in');
      setIsDropdownOpen(true);
    }
  };

  const handleToggleUserMenu = () => {
    setIsOpenUserMenu(!isOpenUserMenu)
  }
  const whoAmICallback = async () => {
    try {
      const data = await whoAmI()
    } catch (e) {
        localStorage.removeItem('session')
        window.location.reload();
    }
  }
//Hàm kiểm tra server
  useEffect(() => {
      fetchNotebooks();
      whoAmICallback();
  },[]) 


  const handleOpenDeleteMenu = (notebookId) => {
    setIsOpenDeleteMenu(true)
  }
  const handleCloseDeleteMenu = () => {
    setIsOpenDeleteMenu(false)
  }
  const handleOpenChangeMenu = (notebookId) => {
    setIsOpenChangeMenu(true)
  }
  const handleCloseChangeMenu = () => {
    setIsOpenChangeMenu(false)
  }

  const handleDelete = async () => {
    try {
      const data = await deleteNotebook(selectedNotebookId);

      console.log(data);
    } catch (error) {
      console.error('Error delete notebooks:', error);
    }
    setIsOpenDeleteMenu(false)
    fetchNotebooks()
    // toggleDropdown();
  };


  const fetchNotebooks = async () => {
    try {
      const data = await fetchAllNotebooks();
      setNotebooks(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setIsLoadingNotebook(true)
    } catch (error) {
      console.error('Error fetching notebooks:', error);
    }
  }
  const handleCreateNotebook = async () => {
    try {
      const data = await createNotebook();
      console.log(data);
      setNotebookCreateLoading(true)
      setTimeout(() => {
        navigate(`/notebook/${data.data.notebook_id}`); 
      }, 1000)
    } catch (error) {
      console.error('Error create notebooks:', error);
    }
  };

  const handleChangeName = async () => {
    try {
      const data = await updateNotebook(selectedNotebookId, selectedNotebookName);
    } catch (error) {
      console.error('Error update notebooks:', error);

    }
    fetchNotebooks()
    setIsOpenChangeMenu(false)

  }


 

  const getDateOnly = (dateTimeString) => {
    const dateTimeObj = new Date(dateTimeString);
    return dateTimeObj.toLocaleDateString();
  };


  const handleNotebookClick = (id) => {
    navigate(`/notebook/${id}`);
    if (!isChatOpen) {
      dispatch({ type: 'TOGGLE_CHAT' });
    }
    if (isOpenSource) {
      dispatch({ type: 'TOGGLE_SOURCE' });
    }
    if (isTutorialOpen) {
      dispatch({ type: 'TOGGLE_TUTORIAL' });
    }
  };

  const handleClickOutside = () => {
    if(isOpenUserMenu){
      setIsOpenUserMenu(false)
    }
    if (isDropdownOpen) {
      setDropdownClass('fade-out');
      setTimeout(() => {
        setIsDropdownOpen(false);
        setDropdownClass('');
      }, 300);
    }
  };

  useEffect(() => {
    const handleMouseEvent = (event) => {
      if (event.button === 4) {
        if (!isChatOpen) {
          dispatch({ type: 'TOGGLE_CHAT' });
        }
        if (isOpenSource) {
          dispatch({ type: 'TOGGLE_SOURCE' });
        }
        if (isTutorialOpen) {
          dispatch({ type: 'TOGGLE_TUTORIAL' });
        }
      }
    };

    const mouseEvents = ['mousedown'];

    mouseEvents.forEach((eventType) => {
      document.addEventListener(eventType, handleMouseEvent);
    });

    return () => {
      mouseEvents.forEach((eventType) => {
        document.removeEventListener(eventType, handleMouseEvent);
      });
    };
  }, []);

  return (
    <div>
      <Helmet>
        <title>NotebookVPI</title>
      </Helmet>
      <div id="home-page" onClick={handleClickOutside}>
        <div className="header">
          <div className="logo-name">NotebookVPI</div>
          <div className="icons">
            <div className="notebook-icons">
              <span className='user-icon' onClick={handleToggleUserMenu}>
                <i className="fa-regular fa-user"></i>
                  <div className={`user-profile-block ${isOpenUserMenu ? 'show' : ''}`} onClick={(event) => {event.stopPropagation()}} > 
                    <UserProfile setIsOpenUserDetail={setIsOpenUserDetail} setIsOpenFeedback={setIsOpenFeedback}/>
                  </div>
                </span>
          </div>
          </div>
        </div>

        {isLoadingNotebook ? (
            <div className="content-container">
              <div className="content">
                <h2 className="content-title">Sổ tay</h2>
                <div className="notebook-grid">
                  <div className="notebook new" onClick={handleCreateNotebook}>
                    <div className="plus">
                    {notebookCreateLoading ? (
                      <FontAwesomeIcon icon={faCircleNotch} spin size="xl" style={{color: "#4d8eff",}} />
                    ) : (
                        <i className="fa-solid fa-plus"></i>
                      )}
                      </div>
                    <div className="label">Sổ tay mới</div>
                  </div>
                  {notebooks.map((notebook) => (
                    <div
                      key={notebook.notebook_id}
                      id={notebook.notebook_id}
                      className="notebook"
                      onClick={() => handleNotebookClick(notebook.notebook_id)}
                    >
                      <div className="notebook-header-homepage">
                        <div className="notebook-icon">
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/330/330705.png"
                            alt=""
                          />
                        </div>
                        <span
                          className="notebook-option"
                          onClick={(event) => toggleDropdown(event, notebook.notebook_id, notebook.title)}
                        >
                          <i className="fa-solid fa-ellipsis-vertical" />
                          {selectedNotebookId === notebook.notebook_id && isDropdownOpen && (
                            <div className={`notebook-option-dropdown ${dropdownClass}`}>
                              <div
                                className="notebook-option-item"
                                onClick={() => handleOpenChangeMenu(notebook.notebook_id)}
                              >
                                <i className="fa-solid fa-pen-to-square"></i>&nbsp;&nbsp;Sửa
                              </div>
                              <div
                                className="notebook-option-item"
                                onClick={() => handleOpenDeleteMenu(notebook.notebook_id)}
                              >
                                <i className="fa-solid fa-trash-can"></i>&nbsp;&nbsp;Xóa Sổ tay
                              </div>
                            </div>
                          )}
                        </span>
                      </div>
                      <span className="notebook-name-homepage">{notebook.title}</span>
                      <div className="notebook-detail">
                        <span className="notebook-date">{getDateOnly(notebook.created_at)}</span>
                        <span>&nbsp;.&nbsp;</span>
                        <span className="notebook-count-source">{notebook.files.length} nguồn</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
                <div className={`notebook-delete-block ${isOpenDeleteMenu ? 'show' : ''}`} onMouseDown={handleCloseDeleteMenu}>
                <div className='notebook-delete' onMouseDown={(event) => {event.stopPropagation()}}>
                  <div className='notebook-delete-name'>Xóa {selectedNotebookName}</div>
                  <div className='notebook-delete-footer'>
                    <button className='notebook-delete-cancel' onClick={handleCloseDeleteMenu}>Hủy</button>
                    <button className='notebook-delete-confirm' onClick={handleDelete}>Xóa</button>
                  </div>

                </div>
              </div>
              
                <div className={`notebook-change-block ${isOpenChangeMenu ? 'show' : ''}`} onMouseDown={handleCloseChangeMenu}>
                <div className='notebook-change' onMouseDown={(event) => {event.stopPropagation()}}>
                  <div className='notebook-change-main'> 
                    <div className='notebook-avatar'> <img src="https://cdn-icons-png.flaticon.com/512/330/330705.png" alt="" /></div>
                    <div className='input-container'>
                      <label htmlFor="notebook-title" className="notebook-label">Tiêu đề của sổ tay</label>
                      <input 
                        className='notebook-change-input' 
                        value={selectedNotebookName} 
                        onChange={(e) => setSelectedNotebookName(e.target.value)}
                        type="text" />
                    </div>
                  </div>
                  <div className='notebook-change-footer'>
                    <button className='notebook-change-cancel' onClick={handleCloseChangeMenu}>Hủy</button>
                    <button className='notebook-change-confirm' onClick={handleChangeName}>Lưu</button>
                  </div>
                </div>
              </div>



            </div> 
        ) : (
          <div className='loading-page'>
          <div className="book">
            <div className="inner">
              <div className="left"></div>
              <div className="middle"></div>
              <div className="right"></div>
            </div>
            <ul>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </div>
          <a className="dribbble" href="https://dribbble.com/shots/7199149-Book-Loader" target="_blank"></a>
        </div>
        )}


      
       
      </div>
        <div>
          <UserDetail 
            isOpenUserDetail={isOpenUserDetail ? 'show': ''}
            closeUserDetail={setIsOpenUserDetail}
          />
          <Feedback 
            isOpenFeedback={isOpenFeedback ? 'show': ''}
            closeFeedback={setIsOpenFeedback}
          />
        </div>
    </div>
    
  );
}

export default HomePage;
