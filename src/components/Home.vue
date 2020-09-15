<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="">
        <span>电商后台</span>
      </div>
      <el-button type="primary" @click="leave">退出</el-button></el-header>
    <el-container>
      <el-aside :width="togglebollen ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleon">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#ffd04b" unique-opened  :collapse="togglebollen" :collapse-transition="false" router
          :default-active="activePath">
          <el-submenu :index="item.id + ' '" v-for="item in menulist" :key="item.id" >
            <template slot="title">
              <i :class="iconObj[item.id]" class="icon1">  </i>
              <span>{{item.authName}}</span>
            </template>
            <!--  二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavStatus('/' + subItem.path)">
              <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view>
        </router-view>
      </el-main>
    </el-container>
  </el-container>

</template>

<script>
export default {
  data () {
    return {
      menulist: [],
      iconObj: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-3702mima',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      togglebollen: false,
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    leave () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      console.log(res)
    },
    toggleon () {
      this.togglebollen = !this.togglebollen
    },
    saveNavStatus (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style scoped lang="less">
  .home-container {
    height: 100%;
  }
  .el-header {
    background-color: #373d41;
    display:flex;
    justify-content: space-between;
    align-items: center;
    color: #ffffff;
    font-size: 20px;
    > div{
      display: flex;
      align-items: center;
    }
  }
  .el-aside {
    background-color:#333744;
    .el-menu {
      border-right: none;
    }
  }
  .el-main {
    background-color:#eaedf1;
  }
  .toggle-button{
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    text-align: center;
    color: white;
    cursor: pointer;
    letter-spacing: 0.2em;
  }
  .icon1{
    vertical-align: middle;
    margin-right: 5px;
    width: 24px;
    text-align: center;
    font-size: 18px;
  }

</style>
