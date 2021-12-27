<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="姓名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getmeds">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table
      :data="meds"
      highlight-current-row
      v-loading="listLoading"
      @selection-change="selsChange"
      style="width: 100%"
    >
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column type="index" width="60"> </el-table-column>
      <el-table-column prop="mname" label="药物名" width="120" sortable>
      </el-table-column>
      <el-table-column prop="mnum" label="数量" width="100" sortable>
      </el-table-column>
      <el-table-column prop="mruday" label="进货日期" width="120" sortable>
      </el-table-column>
      <el-table-column prop="mbaoday" label="保质期" width="120" sortable>
      </el-table-column>
      <el-table-column prop="mhome" label="进货地点" min-width="180" sortable>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="small"
            @click="handleDel(scope.$index, scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-button
        type="danger"
        @click="batchRemove"
        :disabled="this.sels.length === 0"
        >批量删除</el-button
      >
      <el-pagination
        layout="prev, pager, next"
        :page-size="20"
        :total="total"
        style="float: right"
      >
      </el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog
      title="编辑"
      v-model="editFormVisible"
      :close-on-click-modal="false"
    >
      <el-form
        :model="editForm"
        label-width="80px"
        :rules="editFormRules"
        ref="editForm"
      >
        <el-form-item label="药物名" prop="mname">
          <el-input v-model="editForm.mname" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="保质期">
          <el-input v-model="editForm.mbaoday" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number
            v-model="editForm.mnum"
            :min="0"
            :max="200"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="进货日期">
          <el-date-picker
            type="date"
            placeholder="选择日期"
            v-model="editForm.mruday"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="进货地点">
          <el-input type="textarea" v-model="editForm.mhome"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click.native="editSubmit"
          :loading="editLoading"
          >提交</el-button
        >
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog
      title="新增"
      v-model="addFormVisible"
      :close-on-click-modal="false"
    >
      <el-form
        :model="addForm"
        label-width="80px"
        :rules="addFormRules"
        ref="addForm"
      >
        <el-form-item label="药物名" prop="mname">
          <el-input v-model="addForm.mname" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="保质期">
          <el-input v-model="addForm.mbaoday" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number
            v-model="addForm.mnum"
            :min="0"
            :max="200"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="进货日期">
          <el-date-picker
            type="date"
            placeholder="选择日期"
            v-model="addForm.mruday"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="进货地点">
          <el-input type="textarea" v-model="addForm.mhome"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click.native="addSubmit"
          :loading="addLoading"
          >提交</el-button
        >
      </div>
    </el-dialog>
  </section>
</template>

<script>
import util from "../../common/js/util";
import axios from "axios";
//import NProgress from 'nprogress'
import {
  baseapi,
  removeUser,
  batchRemoveUser,
  editUser,
  addUser,
} from "../../api/api";

export default {
  data() {
    return {
      filters: {
        mname: "",
      },
      meds: [],
      total: 0,
      page: 1,
      listLoading: false,
      sels: [], //列表选中列

      editFormVisible: false, //编辑界面是否显示
      editLoading: false,
      editFormRules: {
        mname: [{ required: true, message: "请输入药物名", trigger: "blur" }],
      },
      //编辑界面数据
      editForm: {
        id: 0,
        mname: "",
        mbaoday: "",
        mnum: 0,
        mruday: "",
        mhome: "",
      },

      addFormVisible: false, //新增界面是否显示
      addLoading: false,
      addFormRules: {
        mname: [{ required: true, message: "请输入药物名", trigger: "blur" }],
      },
      //新增界面数据
      addForm: {
        mname: "",
        mbaoday: "",
        mnum: 0,
        mruday: "",
        mhome: "",
      },
    };
  },
  methods: {
    //获取药品列表
    getmeds() {
      let para = {
        page: 5,
        name: 3,
      };
      this.listLoading = true;
      axios.post(baseapi.med_cha, para).then((res) => {
        console.log("res", res);
        this.listLoading = false;
        // this.total = res.data.total;
        this.meds = res.data;
        //NProgress.done();
      });
    },
    //删除
    handleDel: function (index, row) {
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning",
      })
        .then(() => {
          this.listLoading = true;
          //NProgress.start();
          let para = { mid: `'${row.mid}'` };
          axios.post(baseapi.med_del, para).then((res) => {
            console.log("res", res);
            this.listLoading = false;
            this.$message({
              message: res.data,
              type: "info",
            });
            this.getmeds();
          });
        })
        .catch(() => {});
    },
    //显示编辑界面
    handleEdit: function (index, row) {
      this.editFormVisible = true;
      this.editForm = Object.assign({}, row);
    },
    //显示新增界面
    handleAdd: function () {
      this.addFormVisible = true;
      this.addForm = {
        name: "",
        mbaoday: "",
        age: 0,
        mruday: "",
        mhome: "",
      };
    },
    //编辑
    editSubmit: function () {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.editForm);
            para.mruday =
              !para.mruday || para.mruday == ""
                ? ""
                : util.formatDate.format(new Date(para.mruday), "yyyy-MM-dd");
            axios.post(baseapi.med_ch, para).then((res) => {
              console.log("res", res);
              this.editLoading = false;
              this.$message({
                message: res.data,
                type: "info",
              });
              this.getmeds();
            });
          });
        }
      });
    },
    //新增
    addSubmit: function () {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.addForm);
            para.mruday =
              !para.mruday || para.mruday == ""
                ? ""
                : util.formatDate.format(new Date(para.mruday), "yyyy-MM-dd");
            axios.post(baseapi.med_add, para).then((res) => {
              console.log("res", res);
              this.addLoading = false;
              this.$message({
                message: res.data,
                type: "info",
              });
              this.getmeds();
            });
          });
        }
      });
    },
    selsChange: function (sels) {
      this.sels = sels;
    },
    //批量删除
    batchRemove: function () {
      var ids = this.sels.map((item) => `'${item.mid}'`).toString();
      console.log(ids);
      this.$confirm("确认删除选中记录吗？", "提示", {
        type: "warning",
      })
        .then(() => {
          this.listLoading = true;
          //NProgress.start();
          let para = { mid: ids };
          axios.post(baseapi.med_del, para).then((res) => {
            console.log("res", res);
            this.listLoading = false;
            this.$message({
              message: res.data,
              type: "info",
            });
            this.getmeds();
          });
        })
        .catch(() => {});
    },
  },
  mounted() {
    console.log(baseapi.med_cha);
    this.getmeds();
  },
};
</script>

