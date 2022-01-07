<template>
  <div class="roles-container">
    <!-- breadcrumb section -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- main section -->
    <el-card>
      <!--addRoles-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialog = !addRoleDialog">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- roleList section -->
      <el-table :data="rolesList" border>
        <el-table-column type="expand">
          <template #default="scope">
            <el-row v-for="item1 in scope.row.children" :key="item1.id" class="bd-top vcenter">
              <el-col :span="6" class="hcenter">
                <el-tag closable @close="deleteRight(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right vcenter"></i>
              </el-col>
              <el-col :span="18">
                <el-row v-for="(item2, i) in item1.children" :key="item2.id" :class="i === 0 ? '' : 'bd-top' + ' ' + 'vcenter'">
                  <el-col :span="12" class="hcenter">
                    <el-tag type="success" closable @close="deleteRight(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right vcenter"></i>
                  </el-col>
                  <el-col :span="12">
                    <el-tag type="warning" closable v-for="item3 in item2.children" :key="item3.id" @close="deleteRight(scope.row, item3.id)">{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="320">
          <template #default="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="getEditRoleInfo(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="allocateRight(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- addRoleDialog section -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialog" width="50%">
      <el-form ref="addRoleForm" :model="addRoleForm" :rules="roleRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- editRoleDialog section -->
    <el-dialog title="修改角色" :visible.sync="editRoleDialog" width="50%">
      <el-form ref="editRoleForm" :model="editRoleForm" :rules="roleRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- allocaterights dialog section -->
    <el-dialog title="分配权限" :visible.sync="allocateRightDialog" width="50%" @close="allocateRightDialogClose">
      <el-tree ref="treeRef" :data="allocateRightList" :default-expand-all="true" :props="{ label: 'authName', children: 'children' }" node-key="id" :default-checked-keys="roleRightCheckedKey" show-checkbox></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allocateRightDialog = false">取 消</el-button>
        <el-button type="primary" @click="saveAllocateRight()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      rolesList: [],
      allocateRightList: [],
      roleRightCheckedKey: [],
      addRoleForm: {},
      editRoleForm: {},
      addRoleDialog: false,
      editRoleDialog: false,
      allocateRightDialog: false,
      allocateRightRoleId: '',

      //   addRoleRules editRoleRules Validation
      roleRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //   getRolesList
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      this.rolesList = res.data
    },
    // addRole
    addRole() {
      this.$refs.addRoleForm.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('添加失败')
        }
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status === 201) {
          this.getRolesList()
          this.addRoleDialog = false
          this.$message.success('添加成功')
        }
      })
    },
    // editRole
    async getEditRoleInfo(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息错误')
      }
      this.editRoleForm = res.data
      this.editRoleDialog = true
    },
    async editRole() {
      const { data: res } = await this.$http.put('roles/' + this.editRoleForm.roleId, { roleName: this.editRoleForm.roleName, roleDesc: this.editRoleForm.roleDesc })
      if (res.meta.status !== 200) {
        return this.$message.error('编辑失败')
      }
      this.$message.success('编辑成功')
      this.editRoleDialog = false
      this.getRolesList()
    },
    // deleteRole
    async deleteRole(id) {
      const confirmRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((error) => error)
      if (confirmRes !== 'confirm') {
        return this.$message.warning('已取消操作')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.getRolesList()
    },
    // deleteRoleRights
    async deleteRight(row, rightId) {
      const confirmRes = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((error) => error)
      if (confirmRes !== 'confirm') {
        return this.$message.warning('已取消操作')
      }
      const { data: res } = await this.$http.delete(`roles/${row.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      row.children = res.data
      this.$message.success('删除成功')
    },
    // allocateRights
    async allocateRight(row) {
      this.allocateRightRoleId = row.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败!')
      }
      this.allocateRightList = res.data
      this.getLeafKey(row, this.roleRightCheckedKey)
      this.allocateRightDialog = true
    },
    getLeafKey(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getLeafKey(item, arr)
      })
    },
    allocateRightDialogClose() {
      this.roleRightCheckedKey = []
    },
    async saveAllocateRight() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const keysStr = keys.join(',')
      console.log(keysStr)
      console.log(this.allocateRightRoleId)
      const { data: res } = await this.$http.post(`roles/${this.allocateRightRoleId}/rights`, { rids: keysStr })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配成功')
      this.getRolesList()
      this.allocateRightDialog = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-button {
  margin-bottom: 15px;
}
.el-tag {
  margin: 8px;
}
.bd-top {
  border-top: 1px solid #ccc;
}
.vcenter {
  display: flex;
  align-items: center;
}
.hcenter {
  display: flex;
  justify-content: center;
}
</style>
