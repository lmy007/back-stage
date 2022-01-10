<template>
  <div>
    <!-- breadcrumb section -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理 </el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- search section  -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5"><el-button type="primary" @click="showGoodAdd">添加商品</el-button></el-col>
      </el-row>
      <!-- goodList Table -->
      <el-table :data="goodList" border="">
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="价格(元)" width="100"> </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="90"> </el-table-column>
        <el-table-column label="创建时间" width="140">
          <template #default="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template #default="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteGood(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- Pagenation -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-sizes="[10, 15, 20, 25]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'goodList',
  data() {
    return {
      goodList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0
    }
  },
  created() {
    this.getGoodList()
  },
  methods: {
    async getGoodList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodList = res.data.goods
      this.total = res.data.total
      console.log(res.data)
      console.log(this.goodList)
    },
    // pagenation
    handleSizeChange(NewPagesize) {
      this.queryInfo.pagesize = NewPagesize
      this.getGoodList()
    },
    handleCurrentChange(NewPagenum) {
      this.queryInfo.pagenum = NewPagenum
      this.getGoodList()
    },
    // deletegood
    async deleteGood(row) {
      const confirmRef = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((error) => error)
      if (confirmRef !== 'confirm') {
        return this.$message.info('已经取消操作')
      }
      const { data: res } = await this.$http.delete('goods/' + row.goods_id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getGoodList()
    },
    // addGood
    showGoodAdd() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
</style>
