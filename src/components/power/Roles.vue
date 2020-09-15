<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card >
      <el-row>
        <el-col>
          <el-button type="primary"> 添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '','vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row :class="['bdbottom', i2 === 0 ? 'bdtop' : '','vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable
                    @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting " @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
      title="提示"
      :visible.sync="setRightDialogVisible"
      width="50%">
      <el-tree :data="rightList" :props="treeProps" show-checkbox node-key="id" :default-checked-keys="defKeys" default-expand-all></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights" >确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        roleList: [],
        rightList: [],
        setRightDialogVisible: false,
        // 树形控件的属性绑定
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        defKeys: [],
        roleId: ''
      }
    },
    created () {
      this.getRoleList()
    },
    methods: {
      async getRoleList () {
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          this.$message.error('获取角色列表失败')
        }
        this.roleList = res.data
        console.log(this.roleList)
      },
      async removeRightById (role, rightId) {
        const confimResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confimResult !== 'confirm') {
          return this.$message.info('取消删除')
        }
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        role.children = res.data
      },
      async showSetRightDialog (role) {
        this.roleId = role.id
        const { data: res } = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) {
          return this.$message.error('失败')
        }
        this.rightList = res.data
        console.log(this.rightList)
        this.defKeys = []
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
        console.log(this.defKeys)
      },
      getLeafKeys (node, arr) {
        if (!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item => this.getLeafKeys(item, arr))
      },
      async allotRights () {
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
        if (res.meta.status !== 200) {
          return this.$message.error('失败')
        }
        this.$message.success('成功')
        this.getRoleList()
        this.setRightDialogVisible = false
      }
    }
  }
</script>

<style scoped lang="less">
.el-tag {
  margin: 7px;
}
  .bdtop {
    border-top: 1px solid #eeeeee ;
  }

  .bdbottom {
  border-bottom: 1px solid #eeeeee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
