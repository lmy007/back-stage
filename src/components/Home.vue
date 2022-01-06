<template>
  <el-container class="home-container">
    <el-header>
      <div class="left"><img src="../assets/logo.png" alt="" /><span>My Home</span></div>
      <el-button type="primary" @click="logout">退出</el-button>
    </el-header>

    <el-container>
      <!-- aside part -->
      <el-aside :width="isCollapse ? 64 + 'px' : 200 + 'px'">
        <div class="toggle-button" @click="toggleMenu"><i :class="toggleIcon"></i></div>
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#ffd04b" unique-opened :collapse-transition="false" :collapse="isCollapse" router :default-active="activeItem">
          <!-- submenu --1 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title"
              ><i :class="submenIcon[item.id]"></i><span>{{ item.authName }}</span></template
            >
            <!-- level2 menu -->
            <el-menu-item :index="'/' + item.path" v-for="item in item.children" :key="item.id" @click="saveActiveItem('/' + item.path)">
              <template slot="title"
                ><i class="el-icon-menu"></i><span>{{ item.authName }}</span></template
              >
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- main part -->
      <el-main><router-view></router-view></el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      menuList: [],
      submenIcon: {
        125: 'el-icon-s-custom',
        103: 'el-icon-s-help',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-marketing'
      },
      isCollapse: false,
      toggleIcon: 'el-icon-s-fold',
      activeItem: ''
    }
  },
  created() {
    this.getMenu()
    this.activeItem = sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$message.success('退出成功')
      this.$router.push('/login')
    },
    async getMenu() {
      const { data: res } = await this.$http.get('/menus')
      this.menuList = res.data
    },
    toggleMenu() {
      this.isCollapse = !this.isCollapse
      this.toggleIcon = this.isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'
    },
    saveActiveItem(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activeItem = sessionStorage.getItem('activePath')
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  background-color: #000000;
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #fff;
}
.el-menu {
  box-sizing: border-box;
  border: none !important;
}
.el-header .left {
  display: flex;
  align-items: center;
  img {
    height: 50px;
    width: 50px;
    margin: 0 10px;
  }
  span {
    font-size: 30px;
  }
}
.toggle-button {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  font-size: 24px;
  border: none;
  color: #fff;
  cursor: pointer;
  background-color: #333744;
}
.toggle-button:hover {
  background-color: #2a2d37;
}
</style>
