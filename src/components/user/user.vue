<template>
  <div class="user-container">
    <!-- breadcrumb section -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- search section -->
    <el-card>
      <el-row :gutter="30">
        <el-col :span="8">
          <el-input v-model="queryInfo.query" clearable @clear="getUserList"> <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button> </el-input>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="addUserDialog = true">添加用户</el-button>
        </el-col>
      </el-row>
    </el-card>
    <!-- form section -->
    <el-table :data="userList" border>
      <el-table-column type="index" label="#"> </el-table-column>
      <el-table-column prop="username" label="姓名"> </el-table-column>
      <el-table-column prop="email" label="邮箱"> </el-table-column>
      <el-table-column prop="mobile" label="电话"> </el-table-column>
      <el-table-column prop="role_name" label="角色"> </el-table-column>
      <el-table-column label="状态">
        <template #default="scope">
          <el-switch v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="#ff4949" @change="updateState(scope.row.id, scope.row.mg_state)"> </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="getEditUserInfo(scope.row.id)"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
          <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-s-tools" size="mini" @click="allocateRole(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- pagenation section -->
    <el-pagination @size-change="handerSizeChange" @current-change="handerCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[2, 3, 4, 5]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>

    <!-- addUser Dialogue-->
    <el-dialog title="添加用户" :visible.sync="addUserDialog" width="50%" @close="addDialogClose">
      <el-form :model="addUserForm" :rules="addUserRules" ref="addUserForm" label-width="15%">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- editUser Dialogue -->
    <el-dialog title="修改用户" :visible.sync="editUserDialog" width="50%" @close="editDialogClose">
      <el-form :model="editUserForm" :rules="editUserRules" ref="editUserForm" label-width="15%">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- allocateRole Dialogue -->
    <el-dialog title="分配角色" :visible.sync="allocateRoleDialog" width="50%" @close="allocateRoleDialogClose">
      <p>当前的用户: {{ allocateRoleInfo.username }}</p>
      <p>当前的角色: {{ allocateRoleInfo.role_name }}</p>
      <p>
        分配新角色:
        <el-select v-model="selectedRoleId" placeholder="请选择角色">
          <el-option v-for="item in allRoleInfo" :key="item.id" :label="item.roleName" :value="item.id"> </el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allocateRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="saveAllocateRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    const checkEmail = (rule, value, callback) => {
      const regEmail = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (regEmail.test(value)) {
        return callback()
      } else {
        callback(new Error('请输入合法的邮箱'))
      }
    }
    const checkMobile = (rule, value, callback) => {
      const regEmail = /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/
      if (regEmail.test(value)) {
        return callback()
      } else {
        callback(new Error('请输入正确手机号'))
      }
    }
    return {
      // get userlist params
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      searchId: '',
      // addUser section
      addUserDialog: false,
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // editUser section
      editUserDialog: false,
      editUserForm: {},
      // allocateRole Section
      allocateRoleDialog: false,
      allocateRoleInfo: {},
      allRoleInfo: [],
      selectedRoleId: '',
      // validate rule section
      // addUserRules
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户电话', trigger: 'blur' },
          { min: 8, message: '长度在8位之上', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // editUserRules
      editUserRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户电话', trigger: 'blur' },
          { min: 8, message: '长度在8位之上', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        this.$message.error('获取用户列表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // pagenation section trigger when pagesize change
    handerSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize
      console.log(newPageSize)
      this.getUserList()
    },
    // trigger when pagenum change pagenation section
    handerCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      console.log(this.queryInfo.pagesize)
      console.log(newPageNum)
      this.getUserList()
    },
    // updateState for switch
    async updateState(id, state) {
      const { data: res } = await this.$http.put(`/users/${id}/state/${state}`)
      if (res.meta.status === 200) {
        this.$message.success('更改状态成功')
      } else {
        this.$message.error('更改状态失败')
      }
    },
    // addUser section
    addDialogClose() {
      this.$refs.addUserForm.resetFields()
      this.addUserDialog = false
    },
    addUser() {
      this.$refs.addUserForm.validate(async (valid) => {
        if (valid) {
          const { data: res } = await this.$http.post('/users', this.addUserForm)
          if (res.meta.status !== 201) {
            this.$message.error('添加失败')
          }
          this.$message.success('添加成功')
          this.addDialogClose()
          this.getUserList()
        }
      })
    },
    // editUser section
    editDialogClose() {
      this.$refs.editUserForm.resetFields()
      this.editUserDialog = false
    },
    async getEditUserInfo(id) {
      const { data: res } = await this.$http.get('users/' + id)
      console.log(res)
      if (res.meta.status !== 200) {
        this.$message.error('获取用户数据失败')
      } else {
        this.editUserForm = res.data
        this.editUserDialog = true
      }
    },
    editUser() {
      this.$refs.editUserForm.validate(async (valid) => {
        if (valid) {
          const { data: res } = await this.$http.put(`users/+${this.editUserForm.id}`, { email: this.editUserForm.email, mobile: this.editUserForm.mobile })
          if (res.meta.status !== 200) {
            this.$message.error('修改失败' + res.meta.msg)
          }
          this.$message.success('修改成功')
          this.editUserDialog = false
          this.getUserList()
        }
      })
    },
    // delete User section
    async deleteUser(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((error) => {
        console.log(error)
      })
      if (confirmResult !== 'confirm') {
        this.$message('已取消操作')
      } else {
        const { data: res } = await this.$http.delete('users/' + id)
        console.log(res)
        if (res.meta.status === 200) {
          this.$message.success('删除成功')
          this.getUserList()
        } else {
          this.$message.error('删除失败')
        }
      }
    },
    // allocate role section
    async allocateRole(userInfo) {
      this.allocateRoleInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      this.allRoleInfo = res.data
      this.allocateRoleDialog = true
    },
    async saveAllocateRole() {
      console.log(this.selectedRoleId)
      if (!this.selectedRoleId) {
        return this.$message.error('请选择分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.allocateRoleInfo.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('分配失败')
      }
      this.$message.success('分配角色成功')
      this.getUserList()
      console.log(res)
      this.allocateRoleDialog = false
    },
    allocateRoleDialogClose() {
      this.selectedRoleId = ''
    }
  }
}
</script>

<style lang="less" scoped></style>
