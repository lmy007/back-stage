<template>
  <div>
    <!-- breadcrumb section -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理 </el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addGoodCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- Table section -->
      <tree-table ref="goodCateTable" :data="goodCateList" :columns="columnConfigs" :show-index="true" index-text="#" border :show-row-hover="false" :selection-type="false" :expand-type="false">
        <!-- Column3 -->
        <template slot="isOK" scope="scope">
          <i class="el-icon-success" style="color: green" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- Column4 -->
        <template slot="level" scope="scope">
          <el-button size="mini" type="primary" v-if="scope.row.cat_level === 0">一级</el-button>
          <el-button size="mini" type="success" v-if="scope.row.cat_level === 1">二级</el-button>
          <el-button size="mini" type="warning" v-if="scope.row.cat_level === 2">三级</el-button>
        </template>
        <!-- Column5 -->
        <template slot="edit" scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="editCate(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteCate(scope.row)">删除</el-button>
        </template>
      </tree-table>
      <!-- pagenation -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-sizes="[7, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <!-- addGoodCate Dialogue Section -->
    <el-dialog title="添加分类" :visible.sync="addGoodCateDialog" width="50%" @close="resetAddGoodCateDialog">
      <!-- validate Form -->
      <el-form :model="addGoodCateForm" :rules="addCateRules" ref="addGoodCateForm" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addGoodCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader v-model="cascaderInfo" :options="goodCateParentList" :props="{ expandTrigger: 'hover', label: 'cat_name', value: 'cat_id', children: 'children', checkStrictly: 'false' }" @change="handleChange" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <!-- confirm and cancel button -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addGoodCateDialog = false">取 消</el-button>
        <el-button type="primary" @click="saveNewGoodCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- editGoodCate Dialogue -->
    <el-dialog title="修改分类" :visible.sync="editCateDialog" width="50%">
      <el-form :model="editCateForm" :rules="editCateRules" ref="editCateForm" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialog = false">取 消</el-button>
        <el-button type="primary" @click="saveEditCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GoodCate',
  data() {
    return {
      goodCateList: [],
      goodCateParentList: [],
      //   getGoodCateList's query params
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 7
      },
      total: 0,
      //   table column config
      columnConfigs: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isOK' },
        { label: '排序', type: 'template', template: 'level' },
        { label: '操作', type: 'template', template: 'edit' }
      ],
      //   addGoodCatesection
      addGoodCateDialog: false,
      addGoodCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      cascaderInfo: [],

      //   editGoodCateSection
      editCateForm: {
        cat_name: ''
      },
      editCateDialog: false,
      editCateId: '',

      //   validate rule for cat_name
      addCateRules: { cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] },
      editCateRules: { cat_name: [{ required: true, message: '请输入你要修改的名称', trigger: 'blur' }] }
    }
  },
  created() {
    this.getGoodCateList()
  },
  methods: {
    async getGoodCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.goodCateList = res.data.result
      this.total = res.data.total
    },

    // --------------------Pagenation------------------------------------
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getGoodCateList()
    },
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getGoodCateList()
    },
    // -------------------------------------------------------------------
    // -----------------------------------------addGoodCate-----------------------------------------------
    async addGoodCate() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级商品列表失败')
      }
      this.goodCateParentList = res.data
      this.addGoodCateDialog = true
    },
    saveNewGoodCate() {
      this.$refs.addGoodCateForm.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('没有输入分类名称')
        }
        const { data: res } = await this.$http.post('categories', this.addGoodCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.getGoodCateList()
        this.addGoodCateDialog = false
      })
    },
    handleChange() {
      if (this.cascaderInfo.length > 0) {
        this.addGoodCateForm.cat_level = this.cascaderInfo.length
        this.addGoodCateForm.cat_pid = this.cascaderInfo[this.cascaderInfo.length - 1]
      } else {
        this.addGoodCateForm.cat_level = 0
        this.addGoodCateForm.cat_pid = 0
      }
    },
    resetAddGoodCateDialog() {
      this.$refs.addGoodCateForm.resetFields()
      this.addGoodCateForm.cat_level = 0
      this.addGoodCateForm.cat_pid = 0
      this.cascaderInfo = []
    },
    // -----------------------------------------------------editCate---------------------------------------------
    async editCate(row) {
      this.editCateId = row.cat_id
      const { data: res } = await this.$http.get('categories/' + row.cat_id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类名称失败')
      }
      this.editCateForm.cat_name = res.data.cat_name
      this.editCateDialog = true
    },
    saveEditCate() {
      this.$refs.editCateForm.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('修改失败')
        }
        const { data: res } = await this.$http.put('categories/' + this.editCateId, { cat_name: this.editCateForm.cat_name })
        if (res.meta.status !== 200) {
          return this.$message.error('更新失败')
        }
        this.$message.success('更新成功')
        this.getGoodCateList()
        this.editCateDialog = false
      })
    },
    // ----deleteCate-----------------------
    async deleteCate(row) {
      const confirmRes = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((error) => error)
      console.log(confirmRes)
      if (confirmRes !== 'confirm') {
        return this.$message.warning('已取消')
      }
      const { data: res } = await this.$http.delete('categories/' + row.cat_id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.getGoodCateList()
      this.$message.success('删除成功')
    }
  }
}
</script>

<style lang="less" scoped>
.el-button {
  margin-bottom: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
