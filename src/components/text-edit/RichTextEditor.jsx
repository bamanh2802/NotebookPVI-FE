import React, { useEffect, useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import '../text-edit/text-editor.css';
import 'react-quill/dist/quill.snow.css'; 
import { debounce } from 'lodash';
import { noteRenameById, updateContentNote } from '../../service/notebookPage';

const CHARACTER_LIMIT = 5500;

const RichTextEditor = ({ isChange, updateNote, notebookId, noteId, name, content, setSelectedNoteId, isOpen, setIsActive }) => {
  const [editorContent, setEditorContent] = useState(content);
  const [editorName, setEditorName] = useState(name);
  const [isNotActive, setIsNotActive] = useState(false);
  const [characterCount, setCharacterCount] = useState('');
  useEffect(() => {
    if (content) {
    setEditorContent(content);
    setCharacterCount(content.length);
    }
  }, [content]);

  useEffect(() => {
    setEditorName(name);
    setEditorContent(content);
  }, [name, content, isOpen]);

  const changeContent = async (value) => {
  
    if (value.length <= CHARACTER_LIMIT) {
      setEditorContent(value.trim());
      setCharacterCount(value.length);
      debouncedHandleChangeContent(notebookId, noteId, value.trim());
      debouncedUpdateNote(noteId, editorName, value.trim());
    } else {
      setCharacterCount(value.length);
    }
  };

  const handleChangeContent = async (notebookId, noteId, content) => {
    if(noteId){
      try {
        const data = await updateContentNote(notebookId, noteId, content)
        isChange(true)
      } catch (e) {
        console.log(e)
      }
    }
  };

  const debouncedHandleChangeContent = useCallback(debounce(handleChangeContent, 1000), []);
  const debouncedUpdateNote = useCallback(debounce(updateNote, 500), []);

  const handleNameChange = async (event) => {
    if(event.target.value.trim() !== '') {
      try {
        const data = await noteRenameById(notebookId, noteId, event.target.value.trim());
        updateNote(noteId, editorName, editorContent);
        isChange(true)
      } catch (error) {
        console.log('Rename Error');
      }
    }
  };

  const handleExitClick = () => {
    setIsActive()
    setIsNotActive(!isNotActive);
    setSelectedNoteId(null);
  };

  return (
    <div className={`rich-text-editor text-note-input ${isOpen}`}>
      <div className='text-editor-header'>
        <div className='text-editor-header-content'>
          <input
            type="text"
            className='note-header-name'
            value={editorName}
            onChange={(e) => setEditorName(e.target.value)}
            onBlur={handleNameChange}
          />
          <div className='note-header-type'>Ghi chú do con người viết</div>
        </div>
        <div className='text-editor-header-exit' onClick={handleExitClick}>
          <i className="fa-solid fa-down-left-and-up-right-to-center"></i>
        </div>
      </div>
      <ReactQuill
        className='text-editor-main'
        value={editorContent}
        onChange={changeContent}
        placeholder=""
        modules={{
          toolbar: [
            [{ 'header': '1' }, { 'header': '2' }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['clean']
          ],
        }}
        formats={[
          'header', 'font', 'size',
          'bold', 'italic', 'underline', 'strike', 'blockquote',
          'list', 'bullet', 'indent'
        ]}
      />
      <div className='character-count'>
        {characterCount}/{CHARACTER_LIMIT}
      </div>
      {characterCount > CHARACTER_LIMIT && (
        <div className='character-limit-warning'>
          Bạn đã đạt đến giới hạn ký tự cho phép.
        </div>
      )}
    </div>
  );
}

export default RichTextEditor;