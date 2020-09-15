<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
        <el-row :gutter="20">
          <el-col :span="8"><div class="grid-content bg-purple">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </div></el-col>
          <el-col :span="6"><div class="grid-content bg-purple">
            <el-button type="primary" @click="adddialogVisible = true">添加用户</el-button>
          </div></el-col>
        </el-row>
        <el-table :data="userlist" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="姓名" prop="username"></el-table-column>
          <el-table-column label="邮箱" prop="email"></el-table-column>
          <el-table-column label="电话" prop="mobile"></el-table-column>
          <el-table-column label="角色" prop="role_name"></el-table-column>
          <el-table-column label="状态">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.mg_state" @change="mgChangStatus(scope.row)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
              <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable="false">
                <el-button type="warning" icon="el-icon-star-off" size="mini" @click="setRole(scope.row)" ></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>
      <el-dialog
        title="提示"
        :visible.sync="adddialogVisible"
        width="30%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormrules" ref="addFormRef" label-width="100px" >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话号码" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="adddialogVisible = false">取 消</el-button>
    <el-button type="primary"  @click="addUser">确 定</el-button>
  </span>
      </el-dialog>
      <el-dialog
        title="提示"
        :visible.sync="editdialogVisible"
        width="30%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editrules" ref="editFormRef" label-width="100px" >
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email" >
            <el-input v-model="editForm.email" ></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile" >
            <el-input v-model="editForm.mobile" ></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="editdialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUser" >确 定</el-button>
  </span>
      </el-dialog>
      <el-dialog
        title="提示"
        :visible.sync="setRoleDialogVisible"
        width="30%"  @close="setRoleDialogClosed">
        <div>
          <p>当前用户： {{userInfo.username}}</p>
          <p>当前角色： {{userInfo.role_name}}</p>
          <p>请分配新的角色：
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option
                v-for="item in roleList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select></p>
        </div>
        <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
    data () {
      return {
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 2
        },
        userlist: [],
        total: 0,
      adddialogVisible: false,
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        addFormrules: {
          password: [
            { required: true, message: '密码', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          username: [
            { required: true, message: '账号', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '邮箱', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '电话', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ]
        },
        editdialogVisible: false,
        editForm: {},
        editrules: {
          email: [
            { required: true, message: '邮箱', trigger: 'blur' },
            { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '电话', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ]
        },
        setRoleDialogVisible: false,
        userInfo: {},
        roleList: [],
        selectedRoleId: ''
      }
    },
  created () {
      this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取列表失败')
      }
      this.userlist = res.data.users
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async mgChangStatus (userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新失败')
      }
      this.$message.success('更新成功')
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('用户添加失败')
        }
        this.$message.success('用户添加成功')
        this.getUserList()
        this.adddialogVisible = false
      })
    },
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('用户修改失败')
      }
      this.editForm = res.data
      this.editdialogVisible = true
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户
    async editUser () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          moblie: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          this.$message.error('123')
        }
        this.editdialogVisible = false
        this.getUserList()
        this.$message.success('234')
      })
    },
    async removeUserById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$info('已取消')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getUserList()
    },
    async setRole (userInfo) {
      this.setRoleDialogVisible = true
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('失败')
      }
      this.roleList = res.data
    },
    async saveRoleInfo () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色！')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) {
        return this.$message.erro('更新失败')
      }
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    setRoleDialogClosed () {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
    }
  }
</script>

<style scoped>

</style>
