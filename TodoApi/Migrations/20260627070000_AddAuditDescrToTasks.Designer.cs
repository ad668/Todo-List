using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Microsoft.EntityFrameworkCore.Storage;
using TodoApi.Data;

#nullable disable

namespace TodoApi.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260627070000_AddAuditDescrToTasks")]
    partial class AddAuditDescrToTasks
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.0");

            modelBuilder.Entity("TodoApi.Models.TaskItem", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Title")
                        .IsRequired();

                    b.Property<string>("Description");

                    b.Property<string>("TaskType");

                    b.Property<string>("Status");

                    b.Property<string>("ShiftTime");

                    b.Property<DateTime>("CreatedDate");

                    b.Property<DateTime?>("UpdatedDate");

                    b.Property<DateTime?>("CompletedDate");

                    b.Property<int>("ResolutionTimeInMinutes");

                    b.Property<bool>("IsCompleted");

                    b.Property<int>("UserId");

                    b.Property<string>("UserName");

                    b.Property<string>("AuditDescr")
                        .IsRequired();

                    b.HasKey("Id");
                });

            modelBuilder.Entity("TodoApi.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Username")
                        .IsRequired();

                    b.Property<string>("Email")
                        .IsRequired();

                    b.Property<string>("PasswordHash")
                        .IsRequired();

                    b.Property<string>("Role")
                        .IsRequired();

                    b.Property<DateTime>("CreatedDate");

                    b.HasKey("Id");

                    b.HasIndex("Email").IsUnique();

                    b.HasIndex("Username").IsUnique();
                });
#pragma warning restore 612, 618
        }
    }
}

