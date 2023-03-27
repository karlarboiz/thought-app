"use strict";
const thoughtList = document.querySelector('.thought-list');
const thoughtForm = document.getElementById('thought-form');
const closeBtn = document.getElementById('close');
const add = document.getElementById('add');

function convertsLocalDate(val){
    const locale = navigator.language;
    const date = val === '' ? new Date() : new Date(val);
    const localeFormat = new Intl.DateTimeFormat(locale).format;    
    const formatedLocale = localeFormat(date);

    return formatedLocale;
}


async function loadData(){
    let data;

    try{
        data = await fetch('http://localhost:3000/show-thoughts'); 
    }catch(err){
        alert(err)
    }

    const compiledData = await data.json();
    for (const item of compiledData.data) {
        createListOfThoughts(item.id,item.header,item.content,convertsLocalDate(item.date))
    }
   
}

function showEmptyList(a) {

}

function createListOfThoughts(a,b,c,d) {
    const listItem = createElement('li');
    const listContainer = createElement('div');
    const settingsDiv = createElement('div');
    const listHeaderContainer = createElement('div');
    const listHeader = createElement('h5');
    const listContent = createElement('div');
    const listDate = createElement('div');
    const editBtn = createElement('button');
    const deleteBtn = createElement('button');
    const editIcon = createElement('i');
    const deleteIcon = createElement('i');

    listHeader.textContent = b;
    listContent.textContent = c;
    listDate.textContent = d;

    editBtn.appendChild(editIcon);
    deleteBtn.appendChild(deleteIcon);

    editIcon.className = 'fa fa-ellipsis-v';
    deleteIcon.className = 'fa fa-trash';

    editBtn.dataset.link = a
    deleteBtn.dataset.link =a;
    editBtn.setAttribute('type','button');
    deleteBtn.setAttribute('type','button');

    deleteBtn.addEventListener('click',deleteThought);
    editBtn.addEventListener('click',editThought);
    listHeaderContainer.className = 'list-header';
    listContent.className = 'list-content';
    listItem.className = 'list-item';
    listDate.className = 'list-date';
    settingsDiv.className = 'settings-div';

    listHeaderContainer.appendChild(listHeader);
    listHeaderContainer.appendChild(settingsDiv)
    listContainer.appendChild(listHeaderContainer);
    listContainer.appendChild(listDate);
    listContainer.appendChild(listContent);
    
    settingsDiv.appendChild(editBtn);
    settingsDiv.appendChild(deleteBtn);
    listItem.appendChild(listContainer);
    thoughtList.appendChild(listItem);

}

function createElement(el){
    return document.createElement(el)
}

function formState(){
    thoughtForm.classList.toggle('hide')
    add.classList.toggle('hide')
}

async function saveThought(e){
    e.preventDefault();
    let thoughtData;
    const formData = new FormData(thoughtForm);

    if(formData.get('header').trim().length < 6 || 
    formData.get('header').trim().length > 30 ||
    formData.get('content').trim().length < 10) {
        alert('Input not valid')
        return;
    }
    try {
        thoughtData = await fetch('http://localhost:3000/thought-create',{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                header: formData.get('header'),
                content: formData.get('content'),
                date: new Date()
            })
        })
    }catch(err) {
        alert(err)
    }

    formData.set("header","");
    formData.set('content',"")

    const createdThought = await thoughtData.json();
    createListOfThoughts(createdThought.info.id,createdThought.info.header,createdThought.info.content,createdThought.info.date)
    formState()

}

async function deleteThought(e){
    const targetRemove = e.target.parentElement.parentElement.parentElement.parentElement
 
    let id = e.target.dataset.link;
    try {
     await fetch(`http://localhost:3000/thought-delete/${id}`,{
            method: "DELETE"
        })
        targetRemove.remove()
    }catch(err) {
        alert(err)
    }

    
}

async function editThought(e) {
   
    const target = e.target;
    if(target.closest('.fa')) return;
    const updateId = target.dataset.link;
    let thoughtData;
    
    try{
        thoughtData = await fetch(`http://localhost:3000/thought-update/${updateId}`);
    }catch(err){
        alert(err)
    }

    const extractedData = await thoughtData.json();
    const targetParent = target.parentElement.parentElement.parentElement.parentElement;
        const targetDiv = target.parentElement.parentElement.parentElement;
    targetDiv.classList.toggle('hide');
    
    const formCreate = createElement('form');
    const formHeader = createElement('div');
    const btnClose = createElement('button');
    const btnUpdate = createElement('button');
    const iconClose = createElement('i');
    const iconUpdate = createElement('i');
    const formInput = createElement('input');
    const formTextarea = createElement('textarea'); 
    formHeader.className = 'update-btns';
    iconClose.className = "fa fa-times";
    iconUpdate.className = "fa fa-check";

    const formInputAttributes = {
        type: 'text',
        name: 'headerupdate',
        value: `${extractedData.data.header}`
    }

    const formTextareaAttributes = {
        name:"contentupdate",
        cols:30,
        rows:10,
        maxlength: 420
    }

    for (const item in formInputAttributes) {
        formInput.setAttribute(`${item}`,formInputAttributes[item])
    }

    for (const item in formTextareaAttributes) {
        formTextarea.setAttribute(`${item}`,formTextareaAttributes[item])
    }

    formTextarea.textContent = extractedData.data.content;
    formCreate.dataset.link = updateId;
    btnClose.setAttribute('type','button');
    btnUpdate.setAttribute('type','submit');
    btnClose.appendChild(iconClose);
    btnUpdate.appendChild(iconUpdate);
    formHeader.appendChild(btnClose);
    formHeader.appendChild(btnUpdate);
    formCreate.appendChild(formHeader);
    formCreate.appendChild(formInput);
    formCreate.appendChild(formTextarea);
    targetParent.appendChild(formCreate);

    btnClose.addEventListener('click',closeUpdateForm);

    formCreate.addEventListener('submit',updateThought)
}

async function updateThought(e) {
    e.preventDefault();
    const id = e.target.dataset.link;
    let updateThought;

    const updateHeaderInput = document.querySelector('input[name="headerupdate"]');
    const updateContentTextArea = document.querySelector('textarea[name="contentupdate"]');
    try {
        updateThought = await fetch(`http://localhost:3000/thought-update/${id}`,{
            method: "PATCH",
            body: JSON.stringify({
                header: updateHeaderInput.value,
                content: updateContentTextArea.value,
                date: new Date()
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }catch(err) {
        alert(err)
    }
    const updateListItem = e.target.previousSibling;

    const listItemInput = updateListItem.querySelector('h5');
    const listItemTextarea = updateListItem.querySelector('.list-content');
    const listItemDate = updateListItem.querySelector('.list-date');

    listItemInput.textContent = updateHeaderInput.value;
    listItemTextarea.textContent = updateContentTextArea.value;
    listItemDate.textContent = convertsLocalDate('')
    updateListItem.classList.toggle('hide')
    e.target.remove();
}



function closeUpdateForm(e) {
    const target = e.target.parentElement.parentElement.parentElement.parentElement;
    const targetForm =target.querySelector('form');
    const sibling = target.querySelector('div');
    sibling.classList.toggle('hide')
    targetForm.remove();
   
}

closeBtn.addEventListener('click',formState);
add.addEventListener('click',formState);
thoughtForm.addEventListener('submit',saveThought)

loadData();