<template>
  <div class="login-container">
    <div class="login-main">
      <!-- avatar part -->
      <div class="avatar-container"><img src="../assets/logo.png" alt="" /></div>
      <!-- form part -->
      <el-form class="loginForm" ref="loginFormRef" :model="loginForm" :rules="loginRules">
        <el-form-item class="username" prop="username">
          <el-input prefix-icon="el-icon-user-solid" v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item class="password" prop="password">
          <el-input prefix-icon="el-icon-lock" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btn">
          <el-button type="primary" @click="login">Login</el-button>
          <el-button type="info" @click="resetLoginForm">Reset</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' }
          //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 5, max: 12, message: '长度在 5 到 12 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    //   reset loginForm input.value
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        //   pre-check
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status === 200) {
          this.$message({ message: '登录成功', type: 'success' })
          window.sessionStorage.setItem('token', res.data.token)
          this.$router.push('/home')
        } else {
          this.$message({ message: '登录失败', type: 'error' })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  height: 100%;
  background-color: #2b4b6b;
}
.login-main {
  position: relative;
  height: 350px;
  width: 400px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  border-radius: 5px;
}
.avatar-container {
  position: absolute;
  top: 0;
  left: 50%;
  height: 100px;
  width: 100px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background-color: lightcoral;
  img {
    height: 100%;
    width: 100%;
    border-radius: 50%;
    background-color: #fff;
  }
}
.loginForm {
  position: absolute;
  bottom: 20%;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btn {
  display: flex;
  justify-content: space-between;
}
</style>
