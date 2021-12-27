import axios from 'axios';

let base = '';
let medhost = 'http://localhost:3000';
export const requestLogin = params => { return axios.post(`${base}/login`, params).then(res => res.data); };

export const getUserList = params => { return axios.get(`${base}/user/list`, { params: params }); };

export const getUserListPage = params => { return axios.get(`${base}/user/listpage`, { params: params }); };

export const baseapi = {
    med_cha:`${medhost}/med_cha`,
    med_add:`${medhost}/med_add`,
    // 删除
    med_del:`${medhost}/med_del`,
    // 修改
    med_ch:`${medhost}/med_ch`,
    // 批量删除
    med_alldel:`${medhost}/med_alldel`
}