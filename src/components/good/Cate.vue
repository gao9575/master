<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showaddCateDiaolog">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table  class="treeTable" :data="cataList" :columns="columns" :selection-type="false" :expand-type="false"
      show-index index-text="#" border :show-row-hover="false">
        <!-- 是否有效-->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen">
          </i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序-->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" v-else type="warning">三级</el-tag>
        </template>
        <!-- 操作-->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" >编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>

      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
<!--    编辑分类对话框-->
    <el-dialog
      title="提示"
      :visible.sync="addCatDiaoVisble"
      width="30%" @close="addCatDiaoClose">
      <el-form :model="addCatFrom" :rules="addCatFromrules" ref="ruleForm" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCatFrom.cat_name" prop="cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父类名称">
          <el-cascader expand-trigger="hover" :options="partentCatList" :props="cascaderProps"
                       v-model="selectedKeys" @change="parentCateChanged" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCatDiaoVisble = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        cataList: [],
        querInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        total: 0,
        columns: [{
          label: '分类名称',
          prop: 'cat_name'
        },
          {
            label: '是否有效',
            type: 'template',
            template: 'isok'
          },
          {
            label: '排序',
            type: 'template',
            template: 'order'
          },
          {
            label: '操作',
            type: 'template',
            template: 'opt'
          }],
        addCatDiaoVisble: false,
        addCatFrom: {
          cat_name: '',
          cat_pid: 0,
          cat_level: 0
        },
        addCatFromrules: {
          cat_name: [
            { required: true, message: '分类名称', trigger: 'blur' },
            { min: 2, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
          ]
        },
        partentCatList: [],
        cascaderProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        selectedKeys: []
      }
    },
    created () {
      this.getCatList()
    },
    methods: {
      async getCatList () {
        const { data: res } = await this.$http.get('categories', { params: this.querInfo })
        if (res.meta.status !== 200) {
          return this.$message.error('失败')
        }
        console.log(res.data)
        console.log(this.columns)
        this.cataList = res.data.result
        this.total = res.data.total
      },
      handleSizeChange (newSize) {
        this.querInfo.pagesize = newSize
        this.getCatList()
      },
      handleCurrentChange (newPage) {
        this.querInfo.pagenum = newPage
        this.getCatList()
      },
      showaddCateDiaolog () {
        this.getParentCatList()
        this.addCatDiaoVisble = true
      },
      async getParentCatList () {
        const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
        if (res.meta.status !== 200) {
          return this.$message.error('失败')
        }
        console.log(res.data)
        this.partentCatList = res.data
      },
      parentCateChanged () {
        console.log(this.selectedKeys)
        if (this.selectedKeys.length > 0) {
        this.addCatFrom.cat_pid = this.selectedKeys[ this.selectedKeys.length - 1 ]
        this.addCatFrom.cat_level = this.selectedKeys.length
        } else {
          this.addCatFrom.cat_pid = 0
          this.addCatFrom.cat_level = 0
        }
      },
      addCate () {
        this.$refs.ruleForm.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post('categories', this.addCatFrom)
          if (res.data.status !== 200) {
            return this.$message.error('失败')
          }
          this.$message.success('成功')
          this.getCatList()
          this.addCatDiaoVisble = false
        })
      },
      addCatDiaoClose () {
        this.$refs.ruleForm.resetFields()
        this.selectedKeys = []
        this.addCatFrom.cat_pid = 0
        this.addCatFrom.cat_level = 0
      },
      async removeCateById (cat_id) {
        const confimResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confimResult !== 'confirm') {
          return this.$message.info('取消删除')
        }
        const { data: res } = await this.$http.delete(`categories/${cat_id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
      }
    }
  }
</script>

<style scoped>
.treeTable{
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
