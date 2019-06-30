<template>
  <div id="app">
    <el-menu
      :default-active="activeIndex2"
      class="el-menu-demo"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
      <el-menu-item index="1">图书管理</el-menu-item>
    </el-menu>
    <br />
    <el-row>
      <el-col :span="1" class="grid">
        <el-button
          type="success"
          @click="addFlag=true;dialogVisible = true "
          icon="el-icon-circle-plus-outline"
          size="mini"
          round
        >新增</el-button>
      </el-col>
    </el-row>
    <br />
    <el-table
      :data="bookList"
      border
      style="width: 100%"
      stripe
      ref="multipleTable"
      tooltip-effect="dark"
    >
      <el-table-column label="序号" type="index" width="80px" align="center">
        <template slot-scope="scope">
          <span>{{(page - 1) * size + scope.$index + 1}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="Name" label="书名"></el-table-column>
      <el-table-column prop="Author" label="作者"></el-table-column>
      <el-table-column prop="Type" label="种类"></el-table-column>
      <el-table-column prop="Count" label="数量"></el-table-column>
      <el-table-column label="编辑" width="100">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editBook(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
      <el-table-column label="删除" width="100">
        <template slot-scope="scope">
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="delBook(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page"
      :page-sizes="[5, 10, 20]"
      :page-size="size"
      style="float:right"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    <el-dialog
      :title="addFlag?'新增图书':'修改图书'"
      style="text-align:left !important"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
    >
      <el-form ref="form" label-width="80px">
        <el-form-item label="书名" style="width:300px">
          <el-input v-model="book.Name" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="作者" style="width:280px">
          <el-input v-model="book.Author" placeholder="请输入作者名"></el-input>
        </el-form-item>
        <el-form-item label="种类" style="width:230px">
          <el-input v-model="book.Type" placeholder="请输入种类"></el-input>
        </el-form-item>
        <el-form-item label="库存" style="width:190px">
          <el-input v-model="book.Count" placeholder="请输入库存"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" @click="saveBook()">提交</el-button>
        <el-button type="primary" @click="dialogVisible = false">取消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="提示"
      style="text-align:left !important"
      :visible.sync="dialog2Visible"
      :before-close="handleClose"
    >
      <span>你确定要删除这本图书吗?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleDel()">提交</el-button>
        <el-button type="primary" @click="dialog2Visible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
import qs from "qs";
export default {
  data() {
    return {
      dialogVisible: false,
      dialog2Visible: false,
      activeIndex2: "1",
      total: 0,
      size: 5,
      page: 1,
      bookList: [],
      book: {},
      addFlag: true,
      curId: ""
    };
  },
  watch:{
    //2.x版本的bug 以前用1.x发现没有 假如现在是第三页，只有一条数据了。将其删除，就没有第三页了。应该跳到第二页展示出5条数据。
    //可是数据没有展示。原因是获取list的时候page参数没有改变。依然是3
      total(){
        if(this.total==(this.page-1)*this.size&& this.total!=0){
          this.page-=1;
          this.getBookList()
        }
      }
    },
  methods: {
    handleClose(done) {
      done();
    },
    handleSizeChange(val){
      this.size = val
      this.getBookList()
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getBookList();
    },
    async getBookList() {
      try {
        let res = await axios.post(
          "http://127.0.0.1:8848/api/v1/book/list",
          qs.stringify({
            page: this.page,
            size: this.size
          })
        );
        this.total = res.data.Data.Total;
        this.bookList = res.data.Data.List;
        
      } catch (e) {
        console.log(e);
      }
    },
    async saveBook() {
      try {
        let res = await axios.post(
          "http://127.0.0.1:8848/api/v1/book/save",
          qs.stringify({
            id: this.book.ID,
            name: this.book.Name,
            type: this.book.Type,
            author: this.book.Author,
            count: this.book.Count
          })
        );
        this.dialogVisible = false;
        this.book = {};
        this.$message({
          message: res.data.Msg,
          type: "success"
        });
        this.getBookList();
      } catch (e) {
        console.log(e);
      }
    },
    delBook(row) {
      this.addFlag = false;
      this.dialog2Visible = true;
      this.curId = row.ID;
    },
    async handleDel() {
      try {
        let res = await axios.post(
          "http://127.0.0.1:8848/api/v1/book/del",
          qs.stringify({
            id: this.curId
          })
        );
        this.curId = "";
        this.dialog2Visible = false;
        this.$message({
          message: res.data.Msg,
          type: "success"
        });
        this.getBookList();
      } catch (e) {
        console.log(e);
      }
    },
    editBook(row) {
      this.book = row;
      this.dialogVisible = true;
      this.addFlag = false;
    }
  },
  mounted() {
    this.getBookList();
  },


};
</script>

<style>
#app {
  font-family: Helvetica, sans-serif;
  text-align: center;
}
</style>
