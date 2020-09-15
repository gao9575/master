<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>分类参数</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
        <el-alert
          title="注意：只允许为第三级分类设置参数" type="warning" :closable="false" show-icon >
        </el-alert>
        <el-row class="cat_opt">
          <el-col>
            <span>选择商品分类：</span>
            <el-cascader expand-trigger="hover"
              v-model="selectedKeys"
              :options="cataList"
              :props="cateProps"
              @change="handleChange"></el-cascader>
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
              <el-tab-pane label="动态参数" name="many">
              <el-button type="primary" size="mini" :disabled="isBthDisable" @click="adddialogVisible = true">添加参数</el-button>
                <!-- 动态参数页面 -->
                <el-table :data="manyTableData" border stripe>
                  <!-- 展开行 -->
                  <el-table-column type="expand" >
                    <template slot-scope="scope">
                      <!-- 循环渲染Tag标签 -->
                      <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)" >{{item}}</el-tag>
                      <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)"
                      >
                      </el-input>
                      <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                  </el-table-column>
                  <el-table-column type="index"></el-table-column>
                  <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                  <el-table-column label="操作">
                    <template slot-scope="scope">
                      <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                      <el-button type="danger" size="mini" icon="el-icon-delete" @click="remveParams(scope.row.attr_id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="静态属性" name="only">
                <el-button type="primary" size="mini" :disabled="isBthDisable" @click="adddialogVisible = true">添加属性</el-button>
                <!-- 静态属性页面 -->
                <el-table :data="onlyTableData" border stripe>
                  <el-table-column type="expand" ></el-table-column>
                  <el-table-column type="index"></el-table-column>
                  <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                  <el-table-column label="操作">
                    <template slot-scope="scope">
                      <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                      <el-button type="danger" size="mini" icon="el-icon-delete" @click="remveParams(scope.row.attr_id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </el-card>
      <el-dialog
        :title="'添加' + titleText"
        :visible.sync="adddialogVisible"
        width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="adddialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
      </el-dialog>
      <el-dialog
        :title="'编辑' + titleText"
        :visible.sync="editdialogVisible"
        width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="editdialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editParams">确 定</el-button>
  </span>
      </el-dialog>
    </div>
</template>

<script>
  export default {
    data () {
      return {
        cataList: [],
        cateProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        selectedKeys: [],
        activeName: 'many',
        manyTableData: [],
        onlyTableData: [],
        adddialogVisible: false,
        addForm: {
          attr_name: ''
        },
        addFormRules: {
          attr_name: [{
            required: true, message: '请输入参数', trigger: 'blur'
          }]
        },
        editdialogVisible: false,
        editForm: {
          attr_name: ''
        },
        editFormRules: {
          attr_name: [{
            required: true, message: '请输入参数', trigger: 'blur'
          }]
        },
      }
    },
    created () {
      this.getCataList()
    },
    methods: {
      async getCataList () {
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('失败')
        }
        console.log(res.data)
        this.cataList = res.data
      },
      handleChange () {
        if (this.selectedKeys.length !== 3) {
          this.selectedKeys = []
          return
        }
        console.log(this.selectedKeys)
        this.getParmamsData()
      },
      // tab页签
      handleTabClick () {
        console.log(this.activeName)
        this.getParmamsData()
      },
      async getParmamsData () {
        if (this.selectedKeys.length !== 3) {
          this.selectedKeys =[]
          this.manyTableData = []
          this.onlyTableData = []
        }
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
        if (res.meta.status !== 200) {
          console.log(this.selectedKeys[2])
        }
        res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') :[]
          item.inputVisible = false
          item.inputValue = ''
        })
        console.log(res.data)
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      },
      addDialogClosed () {
        this.$refs.addFormRef.resetFields()
      },
      addParams () {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            return this.$message.error('失败')
          }
          this.$message.success('成功')
          this.adddialogVisible = false
          this.getParmamsData()
        })
      },
      editDialogClosed () {
        this.$refs.editFormRef.resetFields()
      },
      async showEditDialog (attr_id) {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,
          { params: {
          attr_sel: this.activeName
        } })
        if (res.meta.status !== 200) {
          return this.$message.error('失败')
        }
        this.editForm = res.data
        this.editdialogVisible = true
      },
      editParams () {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 200) {
            return this.$message.error('失败')
          }
          this.$message.success('成功')
          this.editdialogVisible = false
          this.getParmamsData()
      })
      },
      async remveParams (attr_id) {
        const confirmResult = await this.$confirm(
          '此操作将永久删除该数据，是否继续？',
          '继续',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).catch(err => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已经取消删除!')
        }
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('失败')
        }
        this.$message.success('成功')
        this.getParmamsData()
      },
      showInput (row) {
        row.inputVisible = true
        this.$nextTick(_=> {
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },
      handleInputConfirm (row) {
        if (row.inputValue.trim().length === 0 ) {
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        this.saveAttrVals(row)
      },
      async saveAttrVals (row) {
        const { data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
          attr_name:row.attr_name,
          attr_sel:row.attr_sel,
          attr_vals:row.attr_vals.join(' ')
        })
        if (res.meta.status !== 200) {
          return this.$message.error('失败')
        }
        this.$message.success('成功')
      },
      handleClose (i,row) {
        row.attr_vals.splice(i,1)
        this.saveAttrVals(row)
      }
    },
    computed: {
      isBthDisable () {
        if (this.selectedKeys.length !== 3) {
          return true
        }
        return false
      },
      cateId () {
        if (this.selectedKeys.length === 3) {
          return this.selectedKeys[2]
        }
        return null
      },
      titleText () {
        if (this.activeName === 'many') {
          return '动态参数'
        }
        return '静态属性'
      }
    }
  }
</script>

<style scoped lang="less">
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>
